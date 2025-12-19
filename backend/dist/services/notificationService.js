"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getNotificationsForUser = getNotificationsForUser;
exports.markNotificationRead = markNotificationRead;
const prisma_1 = __importDefault(require("../prisma"));
// const prisma = new PrismaClient(); // Removed local instance
async function createNotification(userId, type, payload, actorId) {
    return prisma_1.default.notification.create({
        data: {
            userId,
            type,
            payload,
            actorId: actorId || null,
        }
    });
}
async function getNotificationsForUser(userId) {
    return prisma_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}
async function markNotificationRead(id) {
    return prisma_1.default.notification.update({ where: { id }, data: { read: true } });
}
exports.default = { createNotification, getNotificationsForUser, markNotificationRead };
//# sourceMappingURL=notificationService.js.map