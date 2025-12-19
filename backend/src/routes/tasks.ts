import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { createTask, updateTask, UpdateTaskInput } from '../services/taskService';

const router = express.Router();
import prisma from '../prisma';

// const prisma = new PrismaClient(); // Removed local instance

const createTaskSchema = z.object({
  title: z.string().max(100),
  description: z.string(),
  dueDate: z.string().datetime(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedToId: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  status: z.enum(['To_Do', 'In_Progress', 'Review', 'Completed']).optional(),
  assignedToId: z.string().optional()
});

router.get('/', async (req: AuthRequest, res) => {
  const start = Date.now();
  console.log(`[Tasks] fetching tasks for user ${req.user.id}`);
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: req.user.id },
          { assignedToId: req.user.id }
        ]
      },
      include: { creator: true, assignedTo: true }
    });
    console.log(`[Tasks] fetched ${tasks.length} tasks in ${Date.now() - start}ms`);
    // Ideally use 'include: { comments: { include: { user: true } } }' but let's fetch on demand or include here
    // For simplicity, let's include comments count? Or just fetch in separate call. 
    // Let's modify to include comments.
    const tasksWithComments = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: req.user.id },
          { assignedToId: req.user.id }
        ]
      },
      include: {
        creator: true,
        assignedTo: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(tasksWithComments);
  } catch (error) {
    console.error('GET /tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, description, dueDate, priority, assignedToId } = createTaskSchema.parse(req.body);
    const io = req.app.get('io');
    const task = await createTask({
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      assignedToId,
    }, req.user.id, io);

    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = updateTaskSchema.parse(req.body);

    const io = req.app.get('io');

    // Transform updates to match the expected type
    const { dueDate, ...otherUpdates } = updates;
    const serviceUpdates: UpdateTaskInput = {
      ...otherUpdates,
      ...(dueDate ? { dueDate: new Date(dueDate) } : {})
    };

    // Use the updateTask service which handles database and socket emission
    const task = await updateTask(id, serviceUpdates, io);

    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
// Comments API
router.post('/:id/comments', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: id,
        userId: req.user.id
      },
      include: { user: true }
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/:taskId/comments/:commentId', async (req: AuthRequest, res) => {
  try {
    const { commentId } = req.params;
    // Check if user owns comment
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;