"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskService_1 = require("../services/taskService");
describe('taskService.createTask', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('emits taskAssigned to assigned user when assignedToId provided', async () => {
        const mockTask = { id: '1', assignedToId: 'bob', title: 't', description: 'd', dueDate: new Date(), priority: 'Low', status: 'To_Do', creator: { id: 'a' }, assignedTo: { id: 'bob' } };
        const mockPrisma = { task: { create: jest.fn().mockResolvedValue(mockTask) } };
        const mockRoom = { emit: jest.fn() };
        const io = { to: jest.fn(() => mockRoom) };
        const res = await (0, taskService_1.createTask)({ title: 't', description: 'd', dueDate: new Date(), priority: 'Low', assignedToId: 'bob' }, 'alice', io, mockPrisma);
        expect(res).toEqual(mockTask);
        expect(io.to).toHaveBeenCalledWith('bob');
        expect(mockRoom.emit).toHaveBeenCalledWith('taskAssigned', mockTask);
    });
    it('assigns to creator when assignedToId not provided', async () => {
        const mockTask = { id: '2', assignedToId: 'alice', title: 't2', description: 'd2', dueDate: new Date(), priority: 'Medium', status: 'To_Do', creator: { id: 'alice' }, assignedTo: { id: 'alice' } };
        const mockPrisma = { task: { create: jest.fn().mockResolvedValue(mockTask) } };
        const mockRoom = { emit: jest.fn() };
        const io = { to: jest.fn(() => mockRoom) };
        const res = await (0, taskService_1.createTask)({ title: 't2', description: 'd2', dueDate: new Date(), priority: 'Medium' }, 'alice', io, mockPrisma);
        expect(res).toEqual(mockTask);
        // When assignedToId === creator, it still should attempt to emit
        expect(io.to).toHaveBeenCalledWith('alice');
        expect(mockRoom.emit).toHaveBeenCalled();
    });
});
//# sourceMappingURL=taskService.test.js.map