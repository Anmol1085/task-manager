"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.updateTask = updateTask;
const notificationService_1 = require("./notificationService");
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Creates a task and emits socket events when appropriate.
 */
async function createTask(input, creatorId, io, prismaClient = prisma_1.default) {
    const task = await prismaClient.task.create({
        data: {
            title: input.title,
            description: input.description,
            dueDate: input.dueDate,
            priority: input.priority,
            status: 'To_Do',
            creatorId,
            assignedToId: input.assignedToId || creatorId,
        },
        include: { creator: true, assignedTo: true },
    });
    // Emit assignment notification to the assigned user room
    try {
        if (io && task.assignedToId) {
            // persist notification
            try {
                await (0, notificationService_1.createNotification)(task.assignedToId, 'taskAssigned', { taskId: task.id, title: task.title }, creatorId);
            }
            catch (err) {
                console.error('Failed to persist notification', err);
            }
            io.to(task.assignedToId).emit('taskAssigned', task);
        }
    }
    catch (err) {
        console.error('Socket emit failed', err);
    }
    return task;
}
async function updateTask(taskId, input, io, prismaClient = prisma_1.default) {
    const task = await prismaClient.task.update({
        where: { id: taskId },
        data: input,
        include: { creator: true, assignedTo: true },
    });
    // Emit real-time update
    try {
        if (io) {
            io.emit('taskUpdated', task);
        }
    }
    catch (err) {
        console.error('Socket emit failed', err);
    }
    return task;
}
exports.default = { createTask, updateTask };
//# sourceMappingURL=taskService.js.map