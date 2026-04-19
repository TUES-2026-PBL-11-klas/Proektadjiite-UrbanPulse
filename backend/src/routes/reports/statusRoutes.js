import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { statusService } from '../../services/StatusService.js';

const router = express.Router({ mergeParams: true });

// PATCH /:id/status — update a report's status (admin only)
router.patch(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(async (req, res) => {
    const result = await statusService.updateStatus(
      req.user.id,
      req.params.id,
      req.body.new_status,
      req.body.comment,
    );
    return res.json(result);
  }),
);

export default router;
