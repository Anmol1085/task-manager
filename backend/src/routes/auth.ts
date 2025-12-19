import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { createAccessToken, createRefreshToken, findRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../services/tokenService';

const router = express.Router();
import prisma from '../prisma';
// const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

function setTokenCookies(res: any, accessToken: string, refreshToken: string, refreshExpiresAt: Date) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const accessToken = createAccessToken({ id: user.id });
    const { token: refreshToken, expiresAt } = await createRefreshToken(user.id);
    setTokenCookies(res, accessToken, refreshToken, expiresAt);

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    // const { email, password } = loginSchema.parse(req.body); // Original line, now replaced by manual check

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = createAccessToken({ id: user.id });
    const { token: refreshToken, expiresAt } = await createRefreshToken(user.id);
    setTokenCookies(res, accessToken, refreshToken, expiresAt);

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    console.error('Login error:', error?.message || String(error));
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', async (req: any, res) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded: any = require('../services/tokenService').verifyAccessToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, profilePicture: user.profilePicture, age: user.age });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/me', async (req: any, res) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded: any = require('../services/tokenService').verifyAccessToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });
    const { name, profilePicture, age } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name,
        profilePicture,
        age: age ? parseInt(age) : null
      }
    });
    res.json({ id: user.id, email: user.email, name: user.name, profilePicture: user.profilePicture, age: user.age });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/me', async (req: any, res) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded: any = require('../services/tokenService').verifyAccessToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    // Implementation choice: Cascade delete in Prisma or manual?
    // Prisma usually handles cascade if configured, but let's be explicit if needed.
    // Assuming Prisma schema relations will handle it or we just delete user.
    // If we have 'onDelete: Cascade' in schema it works. 
    // Let's check schema relations again. Task has relation to User.
    // If not defined, we might need to delete tasks first or let Prisma fail.
    // For now, let's try deleting user. If there are foreign key constraints, we'll see.
    // Actually, looking at schema, relations are standard. Default is usually "Restrict".
    // I should probably manually delete or update tasks to be safe, or just try delete.
    // However, for a "Delete Account" feature, force deleting is expected.

    // Delete related data first to avoid FK constraint errors (if no cascade)
    // Deleting tasks created by user
    await prisma.task.deleteMany({ where: { creatorId: decoded.id } });
    // Deleting refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: decoded.id } });
    // Deleting notifications
    await prisma.notification.deleteMany({ where: { userId: decoded.id } });

    // Finally delete user
    await prisma.user.delete({ where: { id: decoded.id } });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  } catch (err: any) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const dbToken = await findRefreshToken(refreshToken);
    if (!dbToken || dbToken.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // rotate
    const { token: newRefresh, expiresAt } = await rotateRefreshToken(refreshToken, dbToken.userId);
    const accessToken = createAccessToken({ id: dbToken.userId });
    setTokenCookies(res, accessToken, newRefresh, expiresAt);

    res.json({ userId: dbToken.userId });
  } catch (err) {
    res.status(500).json({ error: 'Refresh failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;