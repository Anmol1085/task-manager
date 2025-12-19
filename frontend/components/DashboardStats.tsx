import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Task } from '../types';

interface DashboardStatsProps {
    tasks: Task[];
}

const COLORS = ['#64748b', '#10b981', '#f59e0b', '#3b82f6']; // Slate, Emerald, Amber, Blue

export default function DashboardStats({ tasks }: DashboardStatsProps) {
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const inProgress = tasks.filter(t => t.status === 'In_Progress').length;
        const todo = tasks.filter(t => t.status === 'To_Do').length;
        const review = tasks.filter(t => t.status === 'Review').length;

        return [
            { name: 'To Do', value: todo },
            { name: 'In Progress', value: inProgress },
            { name: 'Review', value: review },
            { name: 'Done', value: completed },
        ];
    }, [tasks]);

    return (
        <div className="glass-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                Task Overview
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#475569' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span style={{ color: '#475569', fontSize: '12px', fontWeight: 500 }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                    <span className="block text-2xl font-bold text-slate-700">{tasks.length}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Tasks</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                    <span className="block text-2xl font-bold text-emerald-600">{stats.find(s => s.name === 'Done')?.value || 0}</span>
                    <span className="text-[10px] text-emerald-600/70 uppercase tracking-wider font-semibold">Completed</span>
                </div>
            </div>
        </div>
    );
}
