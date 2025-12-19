import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/tokenService';

export interface AuthRequest extends Request {
  user?: any;
}

// Authenticate using access token from Authorization header or HttpOnly cookie `accessToken`.
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  console.log(`[Auth] Starting auth for ${req.method} ${req.url}`);
  try {
    const authHeader = req.headers['authorization'];
    // Prioritize header token, fallback to cookie
    let token = authHeader && (authHeader as string).startsWith('Bearer ')
      ? (authHeader as string).split(' ')[1]
      : null;

    if (!token && req.cookies) {
      token = req.cookies['accessToken'];
    }

    if (!token) {
      console.log(`[Auth] No token found for ${req.url}`);
      return res.status(401).json({ error: 'Access token required' });
    }

    const user = verifyAccessToken(token);
    if (!user) {
      console.log(`[Auth] Invalid token for ${req.url}`);
      // Differentiate missing token from invalid token if needed, but 403 is standard for invalid/expired
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    const userId = (user as any).id;
    console.log(`[Auth] Auth successful for user ${userId} on ${req.url} (took ${Date.now() - start}ms)`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal authentication error' });
  }
};