import express from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../db.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { POINT_AWARDS, addPoints } from '../../utils/gamification.js';
import { validateReportId } from './helpers.js';

const router = express.Router({ mergeParams: true });

// POST /:id/vote — cast a vote on a report
router.post(
  '/',
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

// DELETE /:id/vote — remove a vote from a report
router.delete(
  '/',
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

export default router;
