import express from 'express';
import { Category, Prisma, Status } from '@prisma/client';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { sendStatusChangeEmail } from '../utils/email.js';
import {
  upload,
  getUploadedFileUrl,
  removeUploadedFile,
} from '../middleware/uploadMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { POINT_AWARDS, addPoints } from '../utils/gamification.js';
import {
  assertValidStatusTransition,
  isStatusValue,
} from '../utils/reportStatus.js';

const router = express.Router();

const CATEGORY_VALUES = Object.values(Category);
const STATUS_VALUES = Object.values(Status);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REPORT_SELECT = Prisma.sql`
  SELECT
    r.id,
    r.user_id,
    r.category::text AS category,
    r.title,
    r.description,
    r.image_url,
    r.status::text AS status,
    r.heat_score,
    r.vote_count,
    r.created_at,
    r.updated_at,
    r.resolved_at,
    ST_Y(r.location::geometry) AS latitude,
    ST_X(r.location::geometry) AS longitude,
    u.display_name AS author_display_name
  FROM reports r
  INNER JOIN users u ON u.id = r.user_id
`;

const parseCoordinate = (value, fieldName, min, max) => {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${fieldName} must be a number between ${min} and ${max}`);
  }

  return parsed;
};

const parseOptionalDate = (value, fieldName) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return parsed;
};

const formatReportRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  category: row.category,
  title: row.title,
  description: row.description,
  image_url: row.image_url,
  status: row.status,
  vote_count: row.vote_count,
  created_at: row.created_at,
  updated_at: row.updated_at,
  resolved_at: row.resolved_at,
  heat_score: Number(row.heat_score),
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  author: {
    id: row.user_id,
    display_name: row.author_display_name,
  },
});

const validateReportId = (reportId) => UUID_PATTERN.test(reportId);

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { category, title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'image is required' });
    }

    if (!category || !CATEGORY_VALUES.includes(category)) {
      await removeUploadedFile(req.file);
      return res
        .status(400)
        .json({ error: `category must be one of: ${CATEGORY_VALUES.join(', ')}` });
    }

    if (!title?.trim()) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ error: 'title is required' });
    }

    let latitude;
    let longitude;

    try {
      latitude = parseCoordinate(req.body.latitude, 'latitude', -90, 90);
      longitude = parseCoordinate(req.body.longitude, 'longitude', -180, 180);
    } catch (error) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ error: error.message });
    }

    const imageUrl = getUploadedFileUrl(req, req.file);
    const trimmedDescription = description?.trim() || null;

    let rows;

    try {
      rows = await prisma.$queryRaw`
        INSERT INTO reports (
          user_id,
          category,
          title,
          description,
          location,
          image_url,
          updated_at
        )
        VALUES (
          ${req.user.id}::uuid,
          ${category}::"Category",
          ${title.trim()},
          ${trimmedDescription},
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${imageUrl},
          NOW()
        )
        RETURNING
          id,
          user_id,
          category::text AS category,
          title,
          description,
          image_url,
          status::text AS status,
          heat_score,
          vote_count,
          created_at,
          updated_at,
          resolved_at,
          ST_Y(location::geometry) AS latitude,
          ST_X(location::geometry) AS longitude
      `;
    } catch (error) {
      await removeUploadedFile(req.file);
      throw error;
    }

    return res.status(201).json({
      report: {
        ...formatReportRow(rows[0]),
        author: {
          id: req.user.id,
          display_name: req.user.display_name,
        },
      },
    });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      category,
      status,
      date_from: dateFromRaw,
      date_to: dateToRaw,
      min_lat: minLatRaw,
      min_lng: minLngRaw,
      max_lat: maxLatRaw,
      max_lng: maxLngRaw,
      limit: limitRaw,
      offset: offsetRaw,
    } = req.query;

    const conditions = [];

    if (category) {
      if (!CATEGORY_VALUES.includes(category)) {
        return res
          .status(400)
          .json({ error: `category must be one of: ${CATEGORY_VALUES.join(', ')}` });
      }

      conditions.push(Prisma.sql`r.category = ${category}::"Category"`);
    }

    if (status) {
      if (!STATUS_VALUES.includes(status)) {
        return res
          .status(400)
          .json({ error: `status must be one of: ${STATUS_VALUES.join(', ')}` });
      }

      conditions.push(Prisma.sql`r.status = ${status}::"Status"`);
    }

    try {
      const dateFrom = parseOptionalDate(dateFromRaw, 'date_from');
      const dateTo = parseOptionalDate(dateToRaw, 'date_to');

      if (dateFrom) {
        conditions.push(Prisma.sql`r.created_at >= ${dateFrom}`);
      }

      if (dateTo) {
        conditions.push(Prisma.sql`r.created_at <= ${dateTo}`);
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const hasBoundingBoxParams = [
      minLatRaw,
      minLngRaw,
      maxLatRaw,
      maxLngRaw,
    ].some((value) => value !== undefined);

    if (hasBoundingBoxParams) {
      if ([minLatRaw, minLngRaw, maxLatRaw, maxLngRaw].some((value) => value === undefined)) {
        return res.status(400).json({
          error: 'min_lat, min_lng, max_lat, and max_lng must all be provided',
        });
      }

      try {
        const minLat = parseCoordinate(minLatRaw, 'min_lat', -90, 90);
        const minLng = parseCoordinate(minLngRaw, 'min_lng', -180, 180);
        const maxLat = parseCoordinate(maxLatRaw, 'max_lat', -90, 90);
        const maxLng = parseCoordinate(maxLngRaw, 'max_lng', -180, 180);

        if (minLat > maxLat || minLng > maxLng) {
          return res.status(400).json({
            error: 'bounding box minimums must be less than or equal to maximums',
          });
        }

        conditions.push(
          Prisma.sql`
            ST_Within(
              r.location::geometry,
              ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
            )
          `,
        );
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const limit = Math.min(
      Math.max(Number.parseInt(limitRaw ?? '50', 10) || 50, 1),
      100,
    );
    const offset = Math.max(Number.parseInt(offsetRaw ?? '0', 10) || 0, 0);
    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.raw(' AND '))}`
        : Prisma.empty;

    const rows = await prisma.$queryRaw`
      ${REPORT_SELECT}
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return res.json({
      reports: rows.map(formatReportRow),
      pagination: {
        limit,
        offset,
        count: rows.length,
      },
    });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!validateReportId(req.params.id)) {
      return res.status(400).json({ error: 'report id must be a valid UUID' });
    }

    const rows = await prisma.$queryRaw`
      ${REPORT_SELECT}
      WHERE r.id = ${req.params.id}::uuid
      LIMIT 1
    `;

    const row = rows[0];

    if (!row) {
      return res.status(404).json({ error: 'report not found' });
    }

    const statusHistory = await prisma.statusHistory.findMany({
      where: { report_id: req.params.id },
      orderBy: { changed_at: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return res.json({
      report: formatReportRow(row),
      status_history: statusHistory.map((entry) => ({
        id: entry.id,
        report_id: entry.report_id,
        changed_by: entry.changed_by,
        old_status: entry.old_status,
        new_status: entry.new_status,
        comment: entry.comment,
        changed_at: entry.changed_at,
        admin: entry.admin,
      })),
    });
  }),
);

router.post(
  '/:id/vote',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!validateReportId(req.params.id)) {
      return res.status(400).json({ error: 'report id must be a valid UUID' });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const report = await tx.report.findUnique({
          where: { id: req.params.id },
          select: {
            id: true,
          },
        });

        if (!report) {
          return { error: 'report not found', statusCode: 404 };
        }

        await tx.vote.create({
          data: {
            user_id: req.user.id,
            report_id: req.params.id,
          },
        });

        const updatedReport = await tx.report.update({
          where: { id: req.params.id },
          data: {
            vote_count: {
              increment: 1,
            },
          },
          select: {
            id: true,
            vote_count: true,
          },
        });

        const updatedUser = await addPoints(
          tx,
          req.user.id,
          POINT_AWARDS.voteCast,
        );

        return {
          report: updatedReport,
          user: updatedUser,
        };
      });

      if (result.error) {
        return res.status(result.statusCode).json({ error: result.error });
      }

      return res.status(201).json({
        message: 'vote recorded',
        report: result.report,
        user: result.user,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return res.status(409).json({ error: 'user has already voted for this report' });
      }

      throw error;
    }
  }),
);

router.delete(
  '/:id/vote',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!validateReportId(req.params.id)) {
      return res.status(400).json({ error: 'report id must be a valid UUID' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const vote = await tx.vote.findUnique({
        where: {
          user_id_report_id: {
            user_id: req.user.id,
            report_id: req.params.id,
          },
        },
      });

      if (!vote) {
        return { error: 'vote not found', statusCode: 404 };
      }

      await tx.vote.delete({
        where: {
          user_id_report_id: {
            user_id: req.user.id,
            report_id: req.params.id,
          },
        },
      });

      const updatedReport = await tx.report.update({
        where: { id: req.params.id },
        data: {
          vote_count: {
            decrement: 1,
          },
        },
        select: {
          id: true,
          vote_count: true,
        },
      });

      const updatedUser = await addPoints(
        tx,
        req.user.id,
        -POINT_AWARDS.voteCast,
      );

      return {
        report: updatedReport,
        user: updatedUser,
      };
    });

    if (result.error) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    return res.json({
      message: 'vote removed',
      report: result.report,
      user: result.user,
    });
  }),
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(async (req, res) => {
    if (!validateReportId(req.params.id)) {
      return res.status(400).json({ error: 'report id must be a valid UUID' });
    }

    const { new_status: newStatus, comment } = req.body;

    if (!isStatusValue(newStatus)) {
      return res
        .status(400)
        .json({ error: `new_status must be one of: ${STATUS_VALUES.join(', ')}` });
    }

    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          user_id: true,
          title: true,
          status: true,
          resolved_at: true,
          user: { select: { email: true } },
        },
      });

      if (!report) {
        return { error: 'report not found', statusCode: 404 };
      }

      try {
        assertValidStatusTransition(report.status, newStatus);
      } catch (error) {
        return { error: error.message, statusCode: 400 };
      }

      const now = new Date();
      const updatedReport = await tx.report.update({
        where: { id: req.params.id },
        data: {
          status: newStatus,
          updated_at: now,
          resolved_at:
            newStatus === Status.resolved ? report.resolved_at ?? now : report.resolved_at,
        },
        select: {
          id: true,
          user_id: true,
          status: true,
          updated_at: true,
          resolved_at: true,
        },
      });

      const historyEntry = await tx.statusHistory.create({
        data: {
          report_id: req.params.id,
          changed_by: req.user.id,
          old_status: report.status,
          new_status: newStatus,
          comment: comment?.trim() || null,
        },
      });

      if (newStatus === Status.resolved) {
        await addPoints(tx, report.user_id, POINT_AWARDS.reportResolved);
      }

      return {
        report: updatedReport,
        status_history: historyEntry,
        _email: { to: report.user.email, title: report.title },
      };
    });

    if (result.error) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    // Fire-and-forget — does not block the response
    sendStatusChangeEmail(
      result._email.to,
      result._email.title,
      newStatus,
      comment?.trim() || null,
    ).catch((err) => console.error('[email]', err.message));

    const { _email: _, ...response } = result;
    return res.json(response);
  }),
);

export default router;
