import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import prisma from '../prisma';

// const prisma = new PrismaClient();

export function createAccessToken(payload: object) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
}

export async function createRefreshToken(userId: string) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  await (prisma as any).refreshToken.create({
    data: { token, userId, expiresAt }
  });

  return { token, expiresAt };
}

export async function rotateRefreshToken(oldToken: string, userId: string) {
  // remove old token and create a new one
  await (prisma as any).refreshToken.deleteMany({ where: { token: oldToken, userId } });
  return createRefreshToken(userId);
}

export async function findRefreshToken(token: string) {
  return (prisma as any).refreshToken.findUnique({ where: { token } });
}

export async function revokeRefreshToken(token: string) {
  return (prisma as any).refreshToken.deleteMany({ where: { token } });
}

export default { createAccessToken, createRefreshToken, findRefreshToken, rotateRefreshToken, revokeRefreshToken };
