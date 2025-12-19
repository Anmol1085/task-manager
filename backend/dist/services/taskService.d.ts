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
export declare function createTask(input: CreateTaskInput, creatorId: string, io: any, prismaClient?: any): Promise<any>;
export type UpdateTaskInput = Partial<CreateTaskInput> & {
    status?: 'To_Do' | 'In_Progress' | 'Review' | 'Completed';
};
export declare function updateTask(taskId: string, input: UpdateTaskInput, io: any, prismaClient?: any): Promise<any>;
declare const _default: {
    createTask: typeof createTask;
    updateTask: typeof updateTask;
};
export default _default;
//# sourceMappingURL=taskService.d.ts.map