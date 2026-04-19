import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { adminService } from '../services/AdminService.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/analytics/summary', async (req, res) => {
  try {
    return res.json(await adminService.getSummary());
  } catch (err) {
    console.error('[analytics summary]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/analytics/trend', async (req, res) => {
  const { period = 'weekly' } = req.query;
  if (!['weekly', 'monthly'].includes(period))
    return res.status(400).json({ error: 'period must be weekly or monthly' });

  try {
    return res.json(await adminService.getTrend(period));
  } catch (err) {
    console.error('[analytics trend]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/analytics/reports', async (req, res) => {
  try {
    return res.json(await adminService.getAnalyticsReports(req.query));
  } catch (err) {
    console.error('[analytics reports]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    return res.json(await adminService.getUsers());
  } catch (err) {
    console.error('[admin users]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
