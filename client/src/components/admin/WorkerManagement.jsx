import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabaseClient';
import {
    UserPlus,
    Search,
    Trash2,
    Edit,
    Shield,
    ShieldAlert,
    Star,
    DollarSign,
    Phone,
    Mail,
    MoreVertical,
    Briefcase
} from 'lucide-react';

const WorkerManagement = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWorker, setNewWorker] = useState({
        name: '',
        email: '',
        phone: '',
        availability_status: 'active'
    });

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'worker')
                .order('name');

            if (error) throw error;
            setWorkers(data);
        } catch (err) {
            console.error('Error fetching workers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'busy' : 'active';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ availability_status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setWorkers(prev => prev.map(w => w.id === id ? { ...w, availability_status: newStatus } : w));
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleDeleteWorker = async (id) => {
        if (!window.confirm('Are you sure you want to remove this worker? This will NOT delete their account, only their worker role.')) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'user' })
                .eq('id', id);

            if (error) throw error;
            setWorkers(prev => prev.filter(w => w.id !== id));
        } catch (err) {
            alert('Action failed: ' + err.message);
        }
    };

    const handleCreateWorker = async (e) => {
        e.preventDefault();
        alert('Note: In Supabase, workers must sign up themselves or be created via Admin Auth API. This form is for demo purposes.');
        setIsModalOpen(false);
    };

    const filteredWorkers = workers.filter(w =>
        w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Worker Fleet</h2>
                    <p className="text-slate-500 text-sm">Manage your collection agents and their performance</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <UserPlus size={18} /> Onboard New Worker
                </button>
            </div>

            {/* Grid Stats for Workers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <WorkerStat label="Total Fleet" value={workers.length} color="slate" icon={<Users size={18} />} />
                <WorkerStat label="Active Workers" value={workers.filter(w => w.availability_status === 'active').length} color="emerald" icon={<Shield size={18} />} />
                <WorkerStat label="Busy / Off-duty" value={workers.filter(w => w.availability_status !== 'active').length} color="amber" icon={<ShieldAlert size={18} />} />
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search workers by name or email..."
                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Worker List Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredWorkers.map((worker) => (
                    <div key={worker.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    {worker.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{worker.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${worker.availability_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${worker.availability_status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {worker.availability_status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleToggleStatus(worker.id, worker.availability_status)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                                    title="Toggle Availability"
                                >
                                    <Briefcase size={18} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all">
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteWorker(worker.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-3 text-slate-500">
                                <div className="p-2 bg-slate-50 rounded-lg"><Mail size={14} /></div>
                                <span className="text-xs truncate font-medium">{worker.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 font-medium">
                                <div className="p-2 bg-slate-50 rounded-lg"><Phone size={14} /></div>
                                <span className="text-xs">{worker.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50/50 p-2 rounded-xl">
                                <DollarSign size={14} />
                                <span className="text-xs font-bold font-mono">Total: ₹{worker.total_earnings || 0}</span>
                            </div>
                            <div className="flex items-center gap-3 text-amber-600 bg-amber-50/50 p-2 rounded-xl">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold">{worker.rating || 'N/A'} (0 reviews)</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Onboard New Worker</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateWorker} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={newWorker.name}
                                        onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={newWorker.email}
                                        onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={newWorker.phone}
                                        onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-4"
                                >
                                    Complete Onboarding
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const WorkerStat = ({ label, value, color, icon }) => {
    const colorMap = {
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    };
    return (
        <div className={`p-5 rounded-2xl border ${colorMap[color]} flex items-center justify-between shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm font-bold`}>{icon}</div>
                <span className="text-sm font-bold opacity-80">{label}</span>
            </div>
            <span className="text-2xl font-black">{value}</span>
        </div>
    );
};

const X = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const Users = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export default WorkerManagement;
