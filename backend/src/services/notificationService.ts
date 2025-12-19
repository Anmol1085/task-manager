import { PrismaClient } from '@prisma/client';

import prisma from '../prisma';

// const prisma = new PrismaClient(); // Removed local instance

export async function createNotification(userId: string, type: string, payload: any, actorId?: string) {
  return (prisma as any).notification.create({
    data: {
      userId,
      type,
      payload,
      actorId: actorId || null,
    }
  });
}

export async function getNotificationsForUser(userId: string) {
  return (prisma as any).notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function markNotificationRead(id: string) {
  return (prisma as any).notification.update({ where: { id }, data: { read: true } });
}

export default { createNotification, getNotificationsForUser, markNotificationRead };
