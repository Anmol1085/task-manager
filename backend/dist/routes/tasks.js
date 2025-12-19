"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const taskService_1 = require("../services/taskService");
const router = express_1.default.Router();
const prisma_1 = __importDefault(require("../prisma"));
// const prisma = new PrismaClient(); // Removed local instance
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().max(100),
    description: zod_1.z.string(),
    dueDate: zod_1.z.string().datetime(),
    priority: zod_1.z.enum(['Low', 'Medium', 'High', 'Urgent']),
    assignedToId: zod_1.z.string().optional()
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().max(100).optional(),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    priority: zod_1.z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    status: zod_1.z.enum(['To_Do', 'In_Progress', 'Review', 'Completed']).optional(),
    assignedToId: zod_1.z.string().optional()
});
router.get('/', async (req, res) => {
    try {
        const tasks = await prisma_1.default.task.findMany({
            where: {
                OR: [
                    { creatorId: req.user.id },
                    { assignedToId: req.user.id }
                ]
            },
            include: { creator: true, assignedTo: true }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, description, dueDate, priority, assignedToId } = createTaskSchema.parse(req.body);
        const io = req.app.get('io');
        const task = await (0, taskService_1.createTask)({
            title,
            description,
            dueDate: new Date(dueDate),
            priority,
            assignedToId,
        }, req.user.id, io);
        res.json(task);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = updateTaskSchema.parse(req.body);
        const io = req.app.get('io');
        // Transform updates to match the expected type
        const { dueDate, ...otherUpdates } = updates;
        const serviceUpdates = {
            ...otherUpdates,
            ...(dueDate ? { dueDate: new Date(dueDate) } : {})
        };
        // Use the updateTask service which handles database and socket emission
        const task = await (0, taskService_1.updateTask)(id, serviceUpdates, io);
        res.json(task);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            res.status(500).json({ error: 'Failed to update task' });
        }
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.task.delete({ where: { id } });
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map