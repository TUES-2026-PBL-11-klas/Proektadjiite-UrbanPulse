import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authService } from '../services/AuthService.js';

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const result = await authService.register(
    req.body.email?.trim().toLowerCase(),
    req.body.password,
    req.body.display_name?.trim(),
  );
  return res.status(201).json(result);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const result = await authService.login(
    req.body.email?.trim().toLowerCase(),
    req.body.password,
  );
  return res.json(result);
}));

router.patch('/me', authMiddleware, asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user.id, req.body);
  return res.json(result);
}));

export default router;
