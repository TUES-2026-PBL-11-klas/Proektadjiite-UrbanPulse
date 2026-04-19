import { UserRepository, userRepository as defaultUserRepo } from '../repositories/UserRepository.js';
import prismaDefault from '../db.js';

export class AdminService {
  constructor(userRepo = defaultUserRepo, prisma = prismaDefault) {
    this.userRepo = userRepo;
    this.prisma = prisma;
  }

  async getSummary() {
    const [totals] = await this.prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0)
          FILTER (WHERE resolved_at IS NOT NULL) AS avg_resolution_hours
      FROM reports
    `;

    const byStatus = await this.prisma.$queryRaw`
      SELECT status::text, COUNT(*)::int AS count FROM reports GROUP BY status
    `;

    const byCategory = await this.prisma.$queryRaw`
      SELECT category::text, COUNT(*)::int AS count FROM reports GROUP BY category
    `;

    return {
      total: totals.total,
      by_status: byStatus,
      by_category: byCategory,
      avg_resolution_hours: totals.avg_resolution_hours
        ? Number(totals.avg_resolution_hours)
        : null,
    };
  }

  async getTrend(period = 'weekly') {
    if (!['weekly', 'monthly'].includes(period))
      throw new Error('period must be weekly or monthly');

    const truncUnit = period === 'weekly' ? 'week' : 'month';
    return this.prisma.$queryRawUnsafe(`
      SELECT DATE_TRUNC('${truncUnit}', created_at) AS bucket, COUNT(*)::int AS count
      FROM reports GROUP BY bucket ORDER BY bucket ASC
    `);
  }

  async getAnalyticsReports({ category, from, to }) {
    const conditions = ['1=1'];
    const params = [];

    if (category) { params.push(category); conditions.push(`category = $${params.length}::"Category"`); }
    if (from) { params.push(new Date(from)); conditions.push(`created_at >= $${params.length}`); }
    if (to) { params.push(new Date(to)); conditions.push(`created_at <= $${params.length}`); }

    return this.prisma.$queryRawUnsafe(
      `SELECT id, title, category::text, status::text, vote_count, heat_score, created_at, resolved_at
       FROM reports WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 1000`,
      ...params,
    );
  }

  async getUsers() {
    const users = await this.userRepo.findAllWithReportCount();
    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        display_name: u.display_name,
        role: u.role,
        points: u.points,
        level: u.level,
        created_at: u.created_at,
        report_count: u._count.reports,
      })),
    };
  }
}

export const adminService = new AdminService();
