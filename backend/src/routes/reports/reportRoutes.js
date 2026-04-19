import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../../middleware/optionalAuthMiddleware.js';
import { upload, getUploadedFileUrl } from '../../middleware/uploadMiddleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { reportService } from '../../services/ReportService.js';

const router = express.Router();

// POST / — create a new report
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const imageUrl = req.file ? getUploadedFileUrl(req, req.file) : undefined;
    const result = await reportService.createReport(req.user, req.body, req.file, imageUrl);
    return res.status(201).json(result);
  }),
);

// GET / — list reports with optional filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await reportService.listReports(req.query);
    return res.json(result);
  }),
);

// GET /:id — get a single report with its status history
router.get(
  '/:id',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const result = await reportService.getReport(req.params.id, req.user?.id);
    return res.json(result);
  }),
);

export default router;
