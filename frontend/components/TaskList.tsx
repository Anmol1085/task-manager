import { useState } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  isLoading?: boolean;
}

export default function TaskList({ tasks, onTaskUpdate, isLoading }: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'To_Do' | 'In_Progress' | 'Review' | 'Completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  const filteredTasks = tasks.filter(task => filter === 'all' || task.status === filter);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      const priorityOrder = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  });

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse glass-card p-6 border border-slate-200">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-16 bg-slate-100 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>Tasks</span>
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-200">
            {sortedTasks.length}
          </span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'To_Do' | 'In_Progress' | 'Review' | 'Completed')}
              className="appearance-none rounded-xl border border-slate-200 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-700 py-2.5 pl-4 pr-10 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="all" className="bg-white">All Status</option>
              <option value="To_Do" className="bg-white">To Do</option>
              <option value="In_Progress" className="bg-white">In Progress</option>
              <option value="Review" className="bg-white">Review</option>
              <option value="Completed" className="bg-white">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority')}
              className="appearance-none rounded-xl border border-slate-200 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-slate-700 py-2.5 pl-4 pr-10 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="dueDate" className="bg-white">Sort by Due Date</option>
              <option value="priority" className="bg-white">Sort by Priority</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-16 glass-card border border-slate-200 border-dashed rounded-xl">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-700">No tasks found</h3>
          <p className="mt-1 text-sm text-slate-400">Get started by creating a new task above.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {sortedTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdate={onTaskUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}