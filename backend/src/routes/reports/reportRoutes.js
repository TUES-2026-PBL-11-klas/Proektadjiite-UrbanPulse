import express from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../db.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import {
  upload,
  getUploadedFileUrl,
  removeUploadedFile,
} from '../../middleware/uploadMiddleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  CATEGORY_VALUES,
  STATUS_VALUES,
  REPORT_SELECT,
  parseCoordinate,
  parseOptionalDate,
  formatReportRow,
  validateReportId,
} from './helpers.js';

const router = express.Router();

// POST / — create a new report
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

// GET / — list reports with optional filters
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

// GET /:id — get a single report with its status history
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

export default router;
