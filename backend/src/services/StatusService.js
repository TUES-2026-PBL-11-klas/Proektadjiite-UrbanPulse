import { Status } from '@prisma/client';
import { sendStatusChangeEmail } from '../utils/email.js';
import { POINT_AWARDS, addPoints } from '../utils/gamification.js';
import { assertValidStatusTransition, isStatusValue } from '../utils/reportStatus.js';
import { STATUS_VALUES, validateReportId } from '../routes/reports/helpers.js';
import { ValidationError, NotFoundError } from '../errors/AppError.js';
import prismaDefault from '../db.js';

export class StatusService {
  constructor(prisma = prismaDefault) {
    this.prisma = prisma;
  }

  async updateStatus(adminId, reportId, newStatus, comment) {
    if (!validateReportId(reportId)) throw new ValidationError('report id must be a valid UUID');

    if (!isStatusValue(newStatus))
      throw new ValidationError(`new_status must be one of: ${STATUS_VALUES.join(', ')}`);

    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({
        where: { id: reportId },
        select: {
          id: true, user_id: true, title: true, status: true, resolved_at: true,
          user: { select: { email: true } },
        },
      });

      if (!report) return { error: new NotFoundError('report not found') };

      try {
        assertValidStatusTransition(report.status, newStatus);
      } catch (error) {
        return { error: new ValidationError(error.message) };
      }

      const now = new Date();
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: newStatus,
          updated_at: now,
          resolved_at: newStatus === Status.resolved ? report.resolved_at ?? now : report.resolved_at,
        },
        select: { id: true, user_id: true, status: true, updated_at: true, resolved_at: true },
      });

      const historyEntry = await tx.statusHistory.create({
        data: {
          report_id: reportId,
          changed_by: adminId,
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

    if (result.error) throw result.error;

    sendStatusChangeEmail(result._email.to, result._email.title, newStatus, comment?.trim() || null)
      .catch((err) => console.error('[email]', err.message));

    const { _email: _, ...response } = result;
    return response;
  }
}

export const statusService = new StatusService();
