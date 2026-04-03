import { verifyToken } from '../utils/auth.js';

export default function optionalAuthMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      req.user = verifyToken(token);
    } catch {
      // token invalid — treat as unauthenticated, don't fail
    }
  }
  next();
}
