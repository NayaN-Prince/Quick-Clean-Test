import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import {
    Users,
    Trash2,
    CheckCircle,
    Clock,
    DollarSign,
    Bell,
    UserPlus,
    Settings,
    FileText,
    TrendingUp,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingPickups: 0,
        activeWorkers: 0,
        completedJobs: 0,
        totalRevenue: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentRequests();

        const handleNewRequest = (newReq) => {
            console.log('🔔 New Request Received:', newReq);
            fetchStats();
            setRecentRequests(prev => [newReq, ...prev.slice(0, 4)]);
        };

        // Subscribe to real-time updates for requests
        const channel = supabase
            .channel('admin-dashboard-changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'requests'
            }, (payload) => {
                handleNewRequest(payload.new);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStats = async () => {
        try {
            // 1. Total Requests & Groups
            const { data: reqData, error: reqErr } = await supabase
                .from('requests')
                .select('status, estimated_price, final_earning');

            if (reqErr) throw reqErr;

            const total = reqData.length;
            const pending = reqData.filter(r => r.status === 'Pending' || r.status === 'Accepted').length;
            const completed = reqData.filter(r => r.status === 'Completed').length;

            // Calculate revenue from completed jobs (using final_earning if available, else estimated_price)
            const totalRev = reqData
                .filter(r => r.status === 'Completed')
                .reduce((acc, curr) => acc + (parseFloat(curr.final_earning) || parseFloat(curr.estimated_price) || 0), 0);

            // 2. Active Workers (from profiles table)
            const { data: workerData, error: workerErr } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'worker');

            if (workerErr) throw workerErr;

            setStats({
                totalRequests: total,
                pendingPickups: pending,
                activeWorkers: workerData.length,
                completedJobs: completed,
                totalRevenue: totalRev
            });
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        }
    };

    const fetchRecentRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    customer:user_id (name, email),
                    worker:worker_id (name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setRecentRequests(data);
        } catch (err) {
            console.error('Error fetching recent requests:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time overview of Garbage Management Operations</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full border border-slate-200 shadow-sm transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                            {user?.user_metadata?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{user?.user_metadata?.name || 'Administrator'}</span>
                    </div>
                </div>
            </header>

            {/* Real-time Status Banner */}
            <div className="mb-8 bg-indigo-600 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-indigo-200">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp size={24} /> System Health: Optimal
                    </h2>
                    <p className="opacity-80 mt-1 text-sm">Real-time sync enabled. All systems are functioning normally.</p>
                </div>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm">
                    View Analytics Detail
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="text-emerald-600" />}
                    trend="+12.5% from last month"
                    color="emerald"
                />
                <StatCard
                    title="Pending Pickups"
                    value={stats.pendingPickups}
                    icon={<Clock className="text-amber-600" />}
                    trend="Needs immediate attention"
                    color="amber"
                    warning={stats.pendingPickups > 10}
                />
                <StatCard
                    title="Active Workers"
                    value={stats.activeWorkers}
                    icon={<Users className="text-indigo-600" />}
                    trend="82% fleet efficiency"
                    color="indigo"
                />
                <StatCard
                    title="Completed Jobs"
                    value={stats.completedJobs}
                    icon={<CheckCircle className="text-sky-600" />}
                    trend="Goal: 250 this month"
                    color="sky"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Requests Table */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Trash2 size={18} className="text-slate-400" /> Recent Service Requests
                        </h3>
                        <button className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-50/30">
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Weight</th>
                                    <th className="px-6 py-4 font-semibold">Worker</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700">{req.customer?.name || 'Anonymous'}</span>
                                                <span className="text-xs text-slate-400">{req.customer?.email || 'No email'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium capitalize">
                                                {req.garbage_type || 'Mixed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                                            {req.weight_kg} kg
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold ${req.worker ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    {req.worker?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                    </tr>
                                ))}
                                {recentRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">
                                            No active requests found at the moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions Column */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" /> Command Center
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <QuickActionButton icon={<Trash2 size={18} />} label="Manage All Requests" path="/admin-dashboard/requests" />
                            <QuickActionButton icon={<Users size={18} />} label="Worker Fleet" path="/admin-dashboard/workers" color="indigo" />
                            <QuickActionButton icon={<DollarSign size={18} />} label="Rate Management" path="/admin-dashboard/pricing" color="emerald" />
                            <QuickActionButton icon={<FileText size={18} />} label="System Audit Logs" path="/admin-dashboard/logs" color="slate" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold text-lg mb-2">Need a Worker?</h4>
                            <p className="text-white/80 text-sm mb-4">Onboard new collection agents to your fleet and manage availability.</p>
                            <button className="w-full bg-white text-indigo-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                                <UserPlus size={18} /> Add New Worker
                            </button>
                        </div>
                        <Users size={80} className="absolute -bottom-4 -right-4 text-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, color, warning }) => {
    return (
        <div className={`bg-white p-6 rounded-2xl border ${warning ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'} shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 border border-${color}-100`}>
                    {icon}
                </div>
                {warning && <AlertTriangle size={18} className="text-amber-500 animate-pulse" />}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
                <p className={`text-xs mt-2 ${trend.includes('+') ? 'text-emerald-600' : warning ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {trend}
                </p>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
        'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'default': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    const style = styles[status] || styles.default;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}`}>
            {status}
        </span>
    );
};

const QuickActionButton = ({ icon, label, path, color = "indigo" }) => {
    return (
        <button className={`flex items-center gap-3 p-3 w-full text-left rounded-xl border border-slate-100 hover:border-${color}-200 hover:bg-${color}-50/30 transition-all group`}>
            <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-${color}-100 group-hover:text-${color}-600 transition-all`}>
                {icon}
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-all">{label}</span>
        </button>
    );
};

export default AdminDashboard;
