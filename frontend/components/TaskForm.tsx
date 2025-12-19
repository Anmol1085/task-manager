import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedToId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // Format data for API
      const payload = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        assignedToId: data.assignedToId === '' ? undefined : data.assignedToId
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) {
        reset();
        onTaskCreated();
      }
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 mb-8 transition-all hover:shadow-lg animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-emerald-100 rounded-xl shadow-sm text-emerald-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">New Task</h2>
          <p className="text-xs text-slate-500 font-medium">Add a new item to your list</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-emerald-600 transition-colors">Title</label>
          <input
            {...register('title')}
            placeholder="What needs to be done?"
            className="input-primary px-4 py-3 bg-white focus:bg-white text-lg font-medium"
          />
          {errors.title && <p className="mt-1 text-xs font-semibold text-red-500 animate-pulse">{errors.title.message}</p>}
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-indigo-600 transition-colors">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Add some details..."
            className="input-primary px-4 py-3 bg-slate-50/50 focus:bg-white resize-none"
          />
          {errors.description && <p className="mt-1 text-xs font-semibold text-red-500 animate-pulse">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-indigo-600 transition-colors">Due Date</label>
            <input
              type="datetime-local"
              {...register('dueDate')}
              className="input-primary px-4 py-3 bg-slate-50/50 focus:bg-white text-slate-600"
            />
            {errors.dueDate && <p className="mt-1 text-xs font-semibold text-red-500 animate-pulse">{errors.dueDate.message}</p>}
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-emerald-600 transition-colors">Priority</label>
            <div className="relative">
              <select
                {...register('priority')}
                className="input-primary px-4 py-3 bg-white focus:bg-white appearance-none cursor-pointer"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">🚨 Urgent</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {errors.priority && <p className="mt-1 text-xs font-semibold text-red-500 animate-pulse">{errors.priority.message}</p>}
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-emerald-600 transition-colors">Assign to (User ID)</label>
          <input
            {...register('assignedToId')}
            placeholder="Optional - Leave empty to assign to yourself"
            className="input-primary px-4 py-3 bg-slate-50/50 focus:bg-white text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center space-x-2 group"
          >
            {isSubmitting ? (
              <span>Creating...</span>
            ) : (
              <>
                <svg className="w-5 h-5 transition-transform group-hover:scale-110 group-active:scale-95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}