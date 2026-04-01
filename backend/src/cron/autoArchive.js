import cron from "node-cron";
import prisma from "../db.js";

export function registerAutoArchiveCron() {
  cron.schedule("0 0 * * *", async () => {
    console.log("[autoArchive cron] running...");
    try {
      const days = parseInt(process.env.AUTO_ARCHIVE_DAYS ?? "30", 10);

      const stale = await prisma.$queryRaw`
        SELECT id FROM reports
        WHERE status = 'resolved'
          AND resolved_at < NOW() - make_interval(days => ${days})
      `;

      if (!stale.length) {
        console.log("[autoArchive cron] nothing to archive");
        return;
      }

      const ids = stale.map((r) => r.id);

      // Atomic: update status and write history in one transaction
      await prisma.$transaction([
        prisma.$executeRaw`
          UPDATE reports
          SET status = 'archived', updated_at = NOW()
          WHERE id = ANY(${ids}::uuid[])
        `,
        prisma.$executeRaw`
          INSERT INTO status_history
            (id, report_id, changed_by, old_status, new_status, comment, changed_at)
          SELECT
            gen_random_uuid(),
            id,
            NULL,
            'resolved',
            'archived',
            'Auto-archived by system',
            NOW()
          FROM reports
          WHERE id = ANY(${ids}::uuid[])
        `,
      ]);

      console.log(`[autoArchive cron] archived ${stale.length} reports`);
    } catch (err) {
      console.error("[autoArchive cron]", err.message);
    }
  });
}
