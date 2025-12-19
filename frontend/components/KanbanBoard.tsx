import { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: () => void;
}

const COLUMNS = [
    { id: 'To_Do', title: 'To Do' },
    { id: 'In_Progress', title: 'In Progress' },
    { id: 'Review', title: 'Review' },
    { id: 'Completed', title: 'Done' }
];

export default function KanbanBoard({ tasks, onTaskUpdate }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Find the task and the new status
            const task = tasks.find(t => t.id === active.id);
            const newStatus = over.id as Task['status'];

            if (task && task.status !== newStatus) {
                // Optimistic update logic handled by parent or just API call here
                try {
                    await fetch(`/api/tasks/${task.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                        credentials: 'include'
                    });
                    onTaskUpdate();
                } catch (e) { console.error(e); }
            }
        }
        setActiveId(null);
    };

    return (
        <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 h-[calc(100vh-180px)] overflow-x-auto pb-4 px-2 snap-x items-start">
                {COLUMNS.map(col => (
                    <div key={col.id} className="min-w-[300px] w-80 snap-center shrink-0 h-full">
                        <DroppableColumn id={col.id} title={col.title} tasks={tasks.filter(t => t.status === col.id)} onTaskUpdate={onTaskUpdate} />
                    </div>
                ))}
            </div>
            <DragOverlay>
                {activeId ? (
                    <div className="bg-white p-4 rounded shadow-lg opacity-80 w-64">
                        <p className="font-bold">{tasks.find(t => t.id === activeId)?.title}</p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function DroppableColumn({ id, title, tasks, onTaskUpdate }: { id: string, title: string, tasks: Task[], onTaskUpdate: () => void }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="glass-card border-none bg-white/10 p-4 h-full max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:-translate-y-3">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between sticky top-0 bg-white/10 backdrop-blur-md p-2 rounded-lg z-10 shadow-sm border border-white/10 transition-colors group-hover:border-white/20">
                {title}
                <span className="text-xs bg-indigo-500/20 text-white px-2 py-0.5 rounded-full border border-indigo-500/30">{tasks.length}</span>
            </h3>
            <div className="space-y-3 min-h-[100px] flex-1">
                {tasks.map(task => (
                    <DraggableTask key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
                ))}
            </div>
        </div>
    );
}

function DraggableTask({ task, onTaskUpdate }: { task: Task, onTaskUpdate: () => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing group">
            <div className="glass-card p-4 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-indigo-300/50 group-hover:scale-[1.02] group-hover:bg-white/10">
                <h4 className="font-semibold text-white mb-1 group-hover:text-white transition-colors">{task.title}</h4>
                <div className="flex justify-between items-center text-xs text-white/70 group-hover:text-white">
                    <span>{task.priority}</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
