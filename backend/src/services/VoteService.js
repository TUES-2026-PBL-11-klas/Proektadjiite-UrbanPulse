import { Prisma } from '@prisma/client';
import { POINT_AWARDS, addPoints } from '../utils/gamification.js';
import { validateReportId } from '../routes/reports/helpers.js';
import { ValidationError, NotFoundError, ConflictError } from '../errors/AppError.js';
import prismaDefault from '../db.js';

export class VoteService {
  constructor(prisma = prismaDefault) {
    this.prisma = prisma;
  }

  async castVote(userId, reportId) {
    if (!validateReportId(reportId)) throw new ValidationError('report id must be a valid UUID');

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const report = await tx.report.findUnique({ where: { id: reportId }, select: { id: true } });
        if (!report) return { error: new NotFoundError('report not found') };

        await tx.vote.create({ data: { user_id: userId, report_id: reportId } });

        const updatedReport = await tx.report.update({
          where: { id: reportId },
          data: { vote_count: { increment: 1 } },
          select: { id: true, vote_count: true },
        });

        const updatedUser = await addPoints(tx, userId, POINT_AWARDS.voteCast);
        return { report: updatedReport, user: updatedUser };
      });

      if (result.error) throw result.error;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ConflictError('user has already voted for this report');
      throw error;
    }
  }

  async removeVote(userId, reportId) {
    if (!validateReportId(reportId)) throw new ValidationError('report id must be a valid UUID');

    const result = await this.prisma.$transaction(async (tx) => {
      const vote = await tx.vote.findUnique({
        where: { user_id_report_id: { user_id: userId, report_id: reportId } },
      });
      if (!vote) return { error: new NotFoundError('vote not found') };

      await tx.vote.delete({ where: { user_id_report_id: { user_id: userId, report_id: reportId } } });

      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: { vote_count: { decrement: 1 } },
        select: { id: true, vote_count: true },
      });

      const updatedUser = await addPoints(tx, userId, -POINT_AWARDS.voteCast);
      return { report: updatedReport, user: updatedUser };
    });

    if (result.error) throw result.error;
    return result;
  }
}

export const voteService = new VoteService();
