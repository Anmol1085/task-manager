import { useEffect, useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: string;
  payload: any;
  read: boolean;
  createdAt: string;
}

export default function Notifications({ socket, onOpen }: { socket: any, onOpen?: () => void }) {
  const [items, setItems] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) setItems(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchNotifications();
    if (!socket) return;
    socket.on('taskAssigned', async () => {
      // fetch notifications to reflect persisted change
      await fetchNotifications();
    });

    return () => {
      socket.off('taskAssigned');
    };
  }, [socket, fetchNotifications]);

  const markRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
    if (res.ok) fetchNotifications();
  };

  return (
    <div className="glass-card p-4 rounded-xl shadow-xl w-80 sm:w-96 border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <h3 className="font-semibold text-slate-800">Notifications</h3>
        <button onClick={onOpen} className="text-xs text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No notifications yet
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(n => (
              <li
                key={n.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${n.read
                  ? 'bg-slate-50 border-transparent opacity-60 hover:opacity-100'
                  : 'bg-emerald-50/50 border-emerald-100 shadow-sm relative overflow-hidden'
                  }`}
              >
                {!n.read && <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-bl-lg"></div>}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 break-words">
                      {n.type === 'taskAssigned' ? 'Task Assigned' : n.type}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {n.payload?.title || JSON.stringify(n.payload)}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 transition-colors w-full text-right font-medium"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
