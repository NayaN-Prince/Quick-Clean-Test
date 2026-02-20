import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabaseClient';
import {
    Search,
    ChevronDown,
    MoreHorizontal,
    UserCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileDown,
    Printer
} from 'lucide-react';
import { generateInvoice } from '../../utils/invoiceGenerator';

const RequestTable = () => {
    const [requests, setRequests] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const fetchRequests = async () => {
        try {
            setFetchError(null);
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    customer:user_id (name, email, role),
                    worker:worker_id (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('📦 RequestTable fetched data:', data);
            setRequests(data || []);
        } catch (err) {
            console.error('❌ Error fetching requests:', err);
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveWorkers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'worker');

            if (error) throw error;
            setWorkers(data || []);
        } catch (err) {
            console.error('Error fetching workers:', err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchActiveWorkers();

        // Real-time subscription
        const channel = supabase
            .channel('admin-requests-live')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'requests'
            }, () => {
                console.log('🔄 Requests table changed, refreshing...');
                fetchRequests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleAssignWorker = async (requestId, workerId) => {
        try {
            const { error } = await supabase
                .from('requests')
                .update({ worker_id: workerId, status: 'Accepted' })
                .eq('id', requestId);

            if (error) throw error;

            // Update local state
            setRequests(prev => prev.map(req =>
                req.id === requestId
                    ? { ...req, worker_id: workerId, status: 'Accepted' }
                    : req
            ));

            alert('Worker assigned successfully!');
        } catch (err) {
            alert('Assignment failed: ' + err.message);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'all' || req.status === filter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (req.customer?.name?.toLowerCase() || '').includes(searchLower) ||
            (req.garbage_type?.toLowerCase() || '').includes(searchLower) ||
            (req.address?.toLowerCase() || '').includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Request Management</h2>
                    <p className="text-slate-500 text-sm">Monitor and dispatch waste collection requests</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
                    <FileDown size={18} /> Export CSV
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer or waste type..."
                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    {['all', 'Pending', 'Accepted', 'In Progress', 'Completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading requests...</p>
                    </div>
                ) : fetchError ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 p-8 text-center">
                        <AlertCircle size={48} className="text-rose-500" />
                        <h4 className="text-slate-900 font-bold text-lg">Failed to load requests</h4>
                        <p className="text-slate-500 text-sm max-w-md">{fetchError}</p>
                        <button
                            onClick={fetchRequests}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4">Request Details</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Worker</th>
                                    <th className="px-6 py-4">Weight/Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 capitalize">{req.garbage_type}</span>
                                                <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                                                    ID: {req.id.slice(0, 8)}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{req.customer?.name || 'Anonymous'}</span>
                                                <span className="text-[11px] text-slate-400">{req.customer?.email || 'No email provided'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {!req.worker_id ? (
                                                <div className="relative group">
                                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all">
                                                        <UserCheck size={14} /> Assign
                                                        <ChevronDown size={14} />
                                                    </button>
                                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 hidden group-hover:block transition-all">
                                                        <div className="p-2 border-b border-slate-100 italic text-[10px] text-slate-400 px-3">Available Workers</div>
                                                        {workers.length > 0 ? workers.map(w => (
                                                            <button
                                                                key={w.id}
                                                                onClick={() => handleAssignWorker(req.id, w.id)}
                                                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all first:rounded-t-xl last:rounded-b-xl flex items-center justify-between"
                                                            >
                                                                {w.name}
                                                                <span className="text-[9px] bg-green-100 text-green-600 px-1 rounded uppercase">Active</span>
                                                            </button>
                                                        )) : (
                                                            <div className="px-4 py-3 text-xs text-slate-400 italic">No workers found</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                                        {req.worker?.name?.charAt(0) || 'W'}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600">{req.worker?.name || 'Assigned'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{req.weight_kg} kg</span>
                                                <span className="text-xs text-emerald-600 font-semibold">₹{req.estimated_price}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-5 text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => generateInvoice(req)}
                                                className="text-slate-400 hover:text-emerald-600 transition-all p-1.5 hover:bg-emerald-50 rounded-lg"
                                                title="Generate Invoice"
                                            >
                                                <Printer size={18} />
                                            </button>
                                            <button className="text-slate-400 hover:text-slate-600 transition-all p-1.5 hover:bg-slate-100 rounded-lg">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle size={40} className="text-slate-200" />
                                                <p className="text-slate-400 text-sm font-medium italic">No requests match your current filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Pending': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: <Clock size={12} /> },
        'Accepted': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: <Clock size={12} className="animate-spin" /> },
        'In Progress': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: <Clock size={12} className="animate-pulse" /> },
        'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 size={12} /> },
        'default': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: null }
    };
    const s = styles[status] || styles.default;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
            {s.icon}
            {status}
        </span>
    );
};

export default RequestTable;
