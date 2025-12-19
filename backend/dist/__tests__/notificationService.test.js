"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = require("../services/notificationService");
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
        const created = await (0, notificationService_1.createNotification)('u1', 'taskAssigned', { taskId: 't1' }, 'actor');
        expect(created).toBeDefined();
        const list = await (0, notificationService_1.getNotificationsForUser)('u1');
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThanOrEqual(1);
    });
});
//# sourceMappingURL=notificationService.test.js.map