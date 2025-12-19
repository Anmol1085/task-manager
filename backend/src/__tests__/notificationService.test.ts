import { createNotification, getNotificationsForUser } from '../services/notificationService';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'n1', userId: 'u1', type: 'taskAssigned', payload: { taskId: 't1' }, read: false }),
      findMany: jest.fn().mockResolvedValue([{ id: 'n1', userId: 'u1', type: 'taskAssigned', payload: { taskId: 't1' }, read: false }])
    }
  }))
}));

describe('notificationService', () => {
  it('creates and fetches notifications', async () => {
    const created = await createNotification('u1', 'taskAssigned', { taskId: 't1' }, 'actor');
    expect(created).toBeDefined();

    const list = await getNotificationsForUser('u1');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });
});
