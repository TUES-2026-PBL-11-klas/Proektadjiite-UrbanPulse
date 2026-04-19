import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { voteService } from '../../services/VoteService.js';

const router = express.Router({ mergeParams: true });

// POST /:id/vote — cast a vote on a report
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await voteService.castVote(req.user.id, req.params.id);
    return res.status(201).json({ message: 'vote recorded', ...result });
  }),
);

// DELETE /:id/vote — remove a vote from a report
router.delete(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await voteService.removeVote(req.user.id, req.params.id);
    return res.json({ message: 'vote removed', ...result });
  }),
);

export default router;
