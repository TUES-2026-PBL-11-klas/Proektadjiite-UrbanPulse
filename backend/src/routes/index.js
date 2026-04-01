import express from 'express';
import authRoutes from './auth.js';
import reportRoutes from './reports/index.js';
import adminRoutes from './admin.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'UrbanPulse API' });
});

router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
