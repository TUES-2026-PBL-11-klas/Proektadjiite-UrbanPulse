import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const toAuthUser = (user) => ({
  id: user.id,
  email: user.email,
  display_name: user.display_name,
  role: user.role,
  points: user.points,
  level: user.level,
  created_at: user.created_at,
});

export const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
