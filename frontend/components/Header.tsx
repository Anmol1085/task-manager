import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Notifications from './Notifications';
import dynamic from 'next/dynamic';
import SearchBar from './SearchBar';




export default function Header({ socket, onSearch }: { socket: any, onSearch?: (q: string) => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      // Force full reload to clear all client state/sockets
      // Do this regardless of success/failure
      window.location.href = '/login';
    }
  };

  const fetchCount = async () => {
    const res = await fetch('/api/notifications', {
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const items = await res.json();
      setCount(items.filter((i: any) => !i.read).length);
    }
  };

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const user = await res.json();
      setProfilePicture(user.profilePicture);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchUser();
    window.addEventListener('user-updated', fetchUser);
    return () => window.removeEventListener('user-updated', fetchUser);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchCount();
    if (!socket) return;
    socket.on('taskAssigned', () => fetchCount());
    return () => { if (socket) socket.off('taskAssigned'); };
  }, [socket]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200 bg-white/80 transition-all duration-300">
      <div className="absolute inset-0"></div>
      <div className="relative max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="cursor-pointer group flex items-center space-x-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-emerald-500">TM</div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight transition-all font-mono">
              Task Manager
            </h1>
          </Link>
          <nav className="flex space-x-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Search Bar - only show if onSearch serves a purpose (e.g. on Dashboard) */}
        {onSearch && (
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar onSearch={onSearch} />
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* ThemeToggle Removed */}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(s => !s)}
              className="relative p-2.5 text-slate-500 hover:text-emerald-700 transition-all rounded-full hover:bg-emerald-50 active:scale-95 group"
            >
              <svg className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {count > 0 && <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold ring-2 ring-white animate-pulse">{count}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-96 z-50 p-0 overflow-hidden animate-[scaleIn_0.2s_ease-out] origin-top-right">
                <Notifications socket={socket} onOpen={fetchCount} />
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-white/10 mx-2"></div>

          <Link href="/profile" className="flex items-center space-x-3 group pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="h-9 w-9 rounded-full object-cover border-2 border-transparent group-hover:border-purple-400/50 transition-all shadow-sm" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:text-white transition-colors">
                P
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header >
  );
}
