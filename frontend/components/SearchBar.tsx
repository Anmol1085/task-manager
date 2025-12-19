import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(query);
        }, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query, onSearch]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md"
        >
            <button
                onClick={() => onSearch(query)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </motion.div>
    );
}
