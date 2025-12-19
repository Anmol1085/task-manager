import { useState } from 'react';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

// Helper to determine styling (Restored to previous styles)
const priorityStyles: Record<string, string> = {
  Low: 'text-slate-700 bg-slate-100 border-slate-200',
  Medium: 'text-blue-700 bg-blue-50 border-blue-200',
  High: 'text-orange-700 bg-orange-50 border-orange-200',
  Urgent: 'text-red-700 bg-red-50 border-red-200 font-semibold',
};

const statusStyles: Record<string, string> = {
  To_Do: 'text-slate-500',
  In_Progress: 'text-emerald-600 font-medium',
  Review: 'text-purple-600',
  Completed: 'text-slate-400 line-through decoration-slate-400 decoration-1',
};

export default function TaskItem({ task, onUpdate }: TaskItemProps) {

  const [status, setStatus] = useState(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(task.comments || []);

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        setStatus(newStatus);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle === task.title) {
      setIsEditing(false);
      return;
    }
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
        credentials: 'include'
      });
      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update task title', error);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        onUpdate();
      } else {
        const txt = await res.text();
        setError(`Failed: ${res.status} ${txt}`);
        console.error('Delete failed status:', res.status);
      }
    } catch (error: any) {
      setError(`Net Err: ${error.message}`);
      console.error('Failed to delete task', error);
    }
  };

  return (
    <div className="group glass-card p-6 hover-card relative overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md">

      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest border ${priorityStyles[task.priority] || priorityStyles.Low}`}>
              {task.priority}
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${statusStyles[status] || statusStyles.To_Do}`}>
              {status.replace('_', ' ')}
            </span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-serif text-slate-800 border-b-2 border-emerald-500 focus:outline-none w-full bg-transparent"
                autoFocus
              />
              <button onClick={handleSaveEdit} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors">Save</button>
              <button onClick={() => { setIsEditing(false); setEditTitle(task.title); }} className="text-xs text-slate-500 px-2 py-1 hover:text-slate-700">Cancel</button>
            </div>
          ) : (
            <h3 className={`text-xl font-serif text-slate-800 leading-tight transition-colors duration-300 group-hover:text-emerald-700 ${status === 'Completed' ? 'opacity-50' : ''
              }`}>
              {task.title}
            </h3>
          )}

          <p className={`mt-2 text-slate-600 font-sans text-sm leading-relaxed max-w-2xl ${status === 'Completed' ? 'opacity-40' : ''
            }`}>
            {task.description}
          </p>
        </div>

        <div className="ml-8 pt-1 flex items-center gap-3">
          {!isDeleting && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-200 shadow-sm"
                title="Edit Task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={() => setIsDeleting(true)}
                className="p-2 rounded-lg text-red-300 bg-red-500/20 hover:bg-red-500/30 hover:text-red-200 transition-colors border border-red-500/30 shadow-sm"
                title="Delete Task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}

          {isDeleting && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 animate-fadeIn">
                <button onClick={handleDelete} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md font-medium shadow-sm hover:bg-red-700">Confirm</button>
                <button onClick={() => setIsDeleting(false)} className="text-xs text-stone-500 px-2 hover:text-stone-700">Cancel</button>
              </div>
            </div>
          )}

          <div className="relative group/select">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
              className="appearance-none pl-3 pr-8 py-2 rounded-md border border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="To_Do" className="text-slate-700">To Do</option>
              <option value="In_Progress" className="text-slate-700">In Progress</option>
              <option value="Review" className="text-slate-700">Review</option>
              <option value="Completed" className="text-slate-700">Done</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-medium">
          <span>Due</span>
          <span className="text-slate-700 font-sans normal-case text-sm">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
        </div>

        {task.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-medium">
            <span>Assignee</span>
            <span className="text-slate-700 font-sans normal-case text-sm">{task.assignedTo.name}</span>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {comments.length} Comments
        </button>

        {showComments && (
          <div className="mt-3 space-y-3 animate-fadeIn">
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map(comment => (
                <div key={comment.id} className="bg-stone-50 rounded-lg p-3 text-sm group/comment relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-stone-700 text-xs">{comment.user?.name || 'User'}</span>
                    <span className="text-[10px] text-stone-400">{format(new Date(comment.createdAt), 'MMM d, p')}</span>
                  </div>
                  <p className="text-stone-600 leading-snug">{comment.content}</p>

                  <button
                    onClick={async () => {
                      if (!confirm('Delete comment?')) return;
                      try {
                        const res = await fetch(`/api/tasks/${task.id}/comments/${comment.id}`, { method: 'DELETE', credentials: 'include' });
                        if (res.ok) {
                          setComments(prev => prev.filter(c => c.id !== comment.id));
                        }
                      } catch (e) { console.error(e); }
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover/comment:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-stone-400 italic">No comments yet.</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    try {
                      const res = await fetch(`/api/tasks/${task.id}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: newComment }),
                        credentials: 'include'
                      });
                      if (res.ok) {
                        const addedComment = await res.json();
                        setComments(prev => [addedComment, ...prev]);
                        setNewComment('');
                      }
                    } catch (err) { console.error(err); }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}