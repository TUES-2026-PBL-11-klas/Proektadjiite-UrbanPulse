import cron from 'node-cron';
import prisma from '../db.js';

// heat_score = (vote_count * 3) + (nearby_reports_within_500m * 1.5) - (days_since_created * 0.5)
// Runs every 15 minutes on active (submitted / in_progress) reports.
// ST_DWithin on a geography column uses metres natively — 500 = 500 m, no conversion needed.
export function registerHeatScoreCron() {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[heatScore cron] running...');
    try {
      const reports = await prisma.$queryRaw`
        SELECT id, vote_count, created_at
        FROM reports
        WHERE status IN ('submitted', 'in_progress')
      `;

      for (const report of reports) {
        const daysSinceCreated =
          (Date.now() - new Date(report.created_at).getTime()) / 86_400_000;

        // COUNT(*)::int avoids BigInt return from Prisma
        const [{ nearby_count }] = await prisma.$queryRaw`
          SELECT COUNT(*)::int AS nearby_count
          FROM reports
          WHERE id != ${report.id}
            AND status IN ('submitted', 'in_progress')
            AND ST_DWithin(
              location,
              (SELECT location FROM reports WHERE id = ${report.id}),
              500
            )
        `;

        const heatScore =
          report.vote_count * 3 +
          nearby_count * 1.5 -
          daysSinceCreated * 0.5;

        await prisma.$executeRaw`
          UPDATE reports SET heat_score = ${heatScore} WHERE id = ${report.id}
        `;
      }

      console.log(`[heatScore cron] updated ${reports.length} reports`);
    } catch (err) {
      console.error('[heatScore cron]', err.message);
    }
  });
}
