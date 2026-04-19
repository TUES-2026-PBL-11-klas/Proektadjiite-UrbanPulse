import { Prisma } from '@prisma/client';
import prismaDefault from '../db.js';
import { REPORT_SELECT } from '../routes/reports/helpers.js';

export class ReportRepository {
  constructor(prisma = prismaDefault) {
    this.prisma = prisma;
  }

  findById(id) {
    return this.prisma.$queryRaw`
      ${REPORT_SELECT}
      WHERE r.id = ${id}::uuid
      LIMIT 1
    `.then((rows) => rows[0] ?? null);
  }

  findMany(conditions, limit, offset) {
    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.raw(' AND '))}`
        : Prisma.empty;

    return this.prisma.$queryRaw`
      ${REPORT_SELECT}
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  }

  findStatusHistory(reportId) {
    return this.prisma.statusHistory.findMany({
      where: { report_id: reportId },
      orderBy: { changed_at: 'desc' },
      include: {
        admin: { select: { id: true, display_name: true } },
      },
    });
  }

  findVote(userId, reportId) {
    return this.prisma.vote.findUnique({
      where: { user_id_report_id: { user_id: userId, report_id: reportId } },
      select: { user_id: true },
    });
  }
}

export const reportRepository = new ReportRepository();
