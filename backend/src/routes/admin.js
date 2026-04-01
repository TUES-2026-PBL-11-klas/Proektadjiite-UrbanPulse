import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, roleMiddleware('admin'));

// ─── Analytics ───────────────────────────────────────────────────────────────

// GET /api/admin/analytics/summary
// Returns totals by status/category and average resolution time in hours.
router.get('/analytics/summary', async (req, res) => {
  try {
    const [totals] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total,
        AVG(
          EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0
        ) FILTER (WHERE resolved_at IS NOT NULL) AS avg_resolution_hours
      FROM reports
    `;

    const byStatus = await prisma.$queryRaw`
      SELECT status::text, COUNT(*)::int AS count
      FROM reports
      GROUP BY status
    `;

    const byCategory = await prisma.$queryRaw`
      SELECT category::text, COUNT(*)::int AS count
      FROM reports
      GROUP BY category
    `;

    return res.json({
      total:                totals.total,
      by_status:            byStatus,
      by_category:          byCategory,
      avg_resolution_hours: totals.avg_resolution_hours
        ? Number(totals.avg_resolution_hours)
        : null,
    });
  } catch (err) {
    console.error('[analytics summary]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/analytics/trend?period=weekly|monthly
// Returns report counts grouped by time bucket.
router.get('/analytics/trend', async (req, res) => {
  const { period = 'weekly' } = req.query;

  if (!['weekly', 'monthly'].includes(period)) {
    return res.status(400).json({ error: 'period must be weekly or monthly' });
  }

  // $queryRawUnsafe required because DATE_TRUNC needs an SQL keyword literal for
  // the unit. truncUnit is validated against an allowlist above — no injection risk.
  const truncUnit = period === 'weekly' ? 'week' : 'month';

  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT
        DATE_TRUNC('${truncUnit}', created_at) AS bucket,
        COUNT(*)::int                          AS count
      FROM reports
      GROUP BY bucket
      ORDER BY bucket ASC
    `);

    return res.json(rows);
  } catch (err) {
    console.error('[analytics trend]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/analytics/reports?category=&from=&to=
// Filtered report list for export (max 1000 rows).
// Uses $queryRawUnsafe with positional $N params for safe dynamic WHERE.
router.get('/analytics/reports', async (req, res) => {
  const { category, from, to } = req.query;

  const conditions = ['1=1'];
  const params = [];

  if (category) {
    params.push(category);
    // Cast to enum so PostgreSQL accepts the text parameter
    conditions.push(`category = $${params.length}::"Category"`);
  }
  if (from) {
    params.push(new Date(from));
    conditions.push(`created_at >= $${params.length}`);
  }
  if (to) {
    params.push(new Date(to));
    conditions.push(`created_at <= $${params.length}`);
  }

  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT id, title, category::text, status::text, vote_count, heat_score,
              created_at, resolved_at
       FROM reports
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT 1000`,
      ...params,
    );

    return res.json(rows);
  } catch (err) {
    console.error('[analytics reports]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
