import express from 'express';
import authRoutes from './auth.js';
import reportRoutes from './reports/index.js';
import adminRoutes from './admin.js';
import prisma from '../db.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'UrbanPulse API' });
});

// GET /api/stats — public platform statistics
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [row] = await prisma.$queryRaw`
      WITH
        report_stats AS (
          SELECT
            COUNT(*)::int AS total_reports,
            ROUND(
              COUNT(*) FILTER (WHERE status = 'resolved') * 100.0
              / NULLIF(COUNT(*), 0)
            )::int AS resolved_percentage,
            COUNT(*) FILTER (
              WHERE created_at >= NOW() - INTERVAL '7 days'
            )::int AS this_week,
            COUNT(*) FILTER (
              WHERE created_at >= NOW() - INTERVAL '14 days'
                AND created_at < NOW() - INTERVAL '7 days'
            )::int AS last_week
          FROM reports
        ),
        user_stats AS (
          SELECT COUNT(*)::int AS total_users FROM users
        )
      SELECT
        rs.total_reports,
        us.total_users,
        rs.resolved_percentage,
        ROUND(
          (rs.this_week - rs.last_week) * 100.0
          / NULLIF(rs.last_week, 0)
        )::int AS weekly_trend_pct
      FROM report_stats rs, user_stats us
    `;

    return res.json({
      total_reports:       Number(row.total_reports),
      total_users:         Number(row.total_users),
      resolved_percentage: Number(row.resolved_percentage ?? 0),
      weekly_trend_pct:    row.weekly_trend_pct !== null
                             ? Number(row.weekly_trend_pct)
                             : null,
    });
  }),
);

router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
