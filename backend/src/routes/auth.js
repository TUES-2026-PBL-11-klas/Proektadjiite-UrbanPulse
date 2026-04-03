import express from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import prisma from '../db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken, toAuthUser } from '../utils/auth.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const SALT_ROUNDS = 10;

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const displayName = req.body.display_name?.trim();

    if (!email || !password || !displayName) {
      return res
        .status(400)
        .json({ error: 'email, password, and display_name are required' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'password must be at least 8 characters long' });
    }

    try {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          display_name: displayName,
        },
      });

      const authUser = toAuthUser(user);

      return res.status(201).json({
        token: signToken(authUser),
        user: authUser,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return res.status(409).json({ error: 'email already registered' });
      }

      throw error;
    }
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const authUser = toAuthUser(user);

    return res.json({
      token: signToken(authUser),
      user: authUser,
    });
  }),
);

router.patch(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { display_name, current_password, new_password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const updates = {};

    if (display_name !== undefined) {
      const trimmed = display_name?.trim();
      if (!trimmed) {
        return res.status(400).json({ error: 'display_name cannot be empty' });
      }
      updates.display_name = trimmed;
    }

    if (new_password !== undefined) {
      if (!current_password) {
        return res.status(400).json({ error: 'current_password is required to set a new password' });
      }
      const matches = await bcrypt.compare(current_password, user.password_hash);
      if (!matches) {
        return res.status(401).json({ error: 'current password is incorrect' });
      }
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'new password must be at least 8 characters long' });
      }
      updates.password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'no fields to update' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
    });

    const authUser = toAuthUser(updated);

    return res.json({
      token: signToken(authUser),
      user: authUser,
    });
  }),
);

export default router;
