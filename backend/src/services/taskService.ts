import { PrismaClient } from '@prisma/client';
import { createNotification } from './notificationService';

import prisma from '../prisma';

// const prisma = new PrismaClient(); // Removed local instance

export type CreateTaskInput = {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedToId?: string;
};

/**
 * Creates a task and emits socket events when appropriate.
 */
export async function createTask(input: CreateTaskInput, creatorId: string, io: any, prismaClient: any = prisma) {
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
        await createNotification(task.assignedToId, 'taskAssigned', { taskId: task.id, title: task.title }, creatorId);
      } catch (err) {
        console.error('Failed to persist notification', err);
      }
      io.to(task.assignedToId).emit('taskAssigned', task);
    }
  } catch (err) {
    console.error('Socket emit failed', err);
  }

  return task;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  status?: 'To_Do' | 'In_Progress' | 'Review' | 'Completed';
};

export async function updateTask(taskId: string, input: UpdateTaskInput, io: any, prismaClient: any = prisma) {
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
  } catch (err) {
    console.error('Socket emit failed', err);
  }

  return task;
}

export default { createTask, updateTask };
