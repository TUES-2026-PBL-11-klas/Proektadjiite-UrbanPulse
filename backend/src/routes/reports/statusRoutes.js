import express from 'express';
import { Status } from '@prisma/client';
import prisma from '../../db.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { sendStatusChangeEmail } from '../../utils/email.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { POINT_AWARDS, addPoints } from '../../utils/gamification.js';
import {
  assertValidStatusTransition,
  isStatusValue,
} from '../../utils/reportStatus.js';
import { STATUS_VALUES, validateReportId } from './helpers.js';

const router = express.Router({ mergeParams: true });

// PATCH /:id/status — update a report's status (admin only)
router.patch(
  '/',
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
