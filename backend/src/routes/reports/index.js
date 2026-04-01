import express from 'express';
import reportRoutes from './reportRoutes.js';
import voteRoutes from './voteRoutes.js';
import statusRoutes from './statusRoutes.js';

const router = express.Router();

// Core report CRUD: POST /, GET /, GET /:id
router.use('/', reportRoutes);

// Voting: POST /:id/vote, DELETE /:id/vote
router.use('/:id/vote', voteRoutes);

// Status management: PATCH /:id/status
router.use('/:id/status', statusRoutes);

export default router;
