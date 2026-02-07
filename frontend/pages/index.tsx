import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Header from '../components/Header';
import Notifications from '../components/Notifications';
import KanbanBoard from '../components/KanbanBoard';
import DashboardStats from '../components/DashboardStats';
import { Task } from '../types';

export default function Home() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const { data, refetch, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentUser, // Only fetch tasks when user is authenticated
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      // eslint-disable-next-line
      setTasks(data);
    } else if (data) {
      // defensive: backend may return an error object; keep tasks as an array
      console.warn('Unexpected tasks response (expected array):', data);
      setTasks([]);
    }
  }, [data]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
    const newSocket = io(socketUrl);
    // eslint-disable-next-line
    setSocket(newSocket);

    newSocket.on('taskUpdated', (updatedTask: Task) => {
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    });

    newSocket.on('taskAssigned', (newTask: Task) => {
      setTasks(prev => [...prev, newTask]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // fetch current user and tell socket to join room
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          if (mounted) {
            setCurrentUser(user);
            setIsAuthChecking(false);
            if (socket && user?.id) socket.emit('join', user.id);
          }
        } else {
          if (mounted) router.push('/login');
        }
      } catch (error) {
        if (mounted) router.push('/login');
      }
    })();
    return () => { mounted = false; };
  }, [socket, router]);

  const handleTaskUpdate = () => {
    refetch();
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header socket={socket} onSearch={setSearchQuery} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          <div className="flex justify-end mb-6 gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-stone-400 hover:text-white'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-stone-400 hover:text-white'}`}
            >
              Board View
            </button>
          </div>

          {viewMode === 'board' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <KanbanBoard tasks={filteredTasks} onTaskUpdate={handleTaskUpdate} />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardStats tasks={tasks} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <TaskForm onTaskCreated={handleTaskUpdate} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                      <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Assigned To Me</h2>
                  </div>
                  <TaskList tasks={filteredTasks.filter(t => t.assignedToId === currentUser?.id)} onTaskUpdate={handleTaskUpdate} isLoading={isLoading} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Created By Me</h2>
                  </div>
                  <TaskList tasks={filteredTasks.filter(t => t.creatorId === currentUser?.id)} onTaskUpdate={handleTaskUpdate} isLoading={isLoading} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Overdue</h2>
                  </div>
                  <TaskList tasks={filteredTasks.filter(t => new Date(t.dueDate) < new Date())} onTaskUpdate={handleTaskUpdate} isLoading={isLoading} />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Notifications socket={socket} onOpen={handleTaskUpdate} />
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}