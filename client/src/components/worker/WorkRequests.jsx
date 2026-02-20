import React, { useState, useEffect, useContext } from 'react';
import supabase from '../../config/supabaseClient';
import { getUnassignedRequests, acceptRequest } from '../../services/supabaseWorkerService';
import { AuthContext } from '../../context/AuthContext';

const WorkRequests = ({ onAction }) => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();

        // Real-time subscription for new requests
        const channel = supabase
            .channel('new_requests')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, (payload) => {
                if (payload.new.status === 'Pending') {
                    setJobs(prev => [payload.new, ...prev]);
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests' }, (payload) => {
                if (payload.new.worker_id !== null) {
                    setJobs(prev => prev.filter(j => j.id !== payload.new.id));
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const loadJobs = async () => {
        try {
            const data = await getUnassignedRequests();
            setJobs(data);
        } catch (err) {
            console.error('Error loading jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (jobId) => {
        try {
            await acceptRequest(jobId, user.id);
            setJobs(jobs.filter(j => j.id !== jobId));
            if (onAction) onAction();
        } catch (err) {
            alert(err.message || 'Error accepting job');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading available jobs...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-outfit">Available Pickups</h3>
            {jobs.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center border-2 border-dashed border-gray-100 text-gray-400">
                    No pending jobs right now. Check back soon!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-48 relative overflow-hidden">
                                <img
                                    src={job.image_url || 'https://via.placeholder.com/400x200'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    alt="Garbage"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-green-700 shadow-sm border border-green-100">
                                    {job.garbage_type}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono mb-1 uppercase tracking-tighter">#{job.id.slice(0, 8)}</p>
                                        <h4 className="text-lg font-bold text-gray-900 leading-tight truncate w-48">{job.address}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-green-600 tracking-tighter">₹{(parseFloat(job.estimated_price) * 0.7).toFixed(0)}</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Estimated Earning</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-2 rounded-xl">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Weight</p>
                                        <p className="text-sm font-bold text-gray-700">{job.weight_kg} KG</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-xl">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Urgency</p>
                                        <p className="text-sm font-bold text-gray-700">Standard</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAccept(job.id)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 group-active:scale-95"
                                >
                                    Accept Job Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkRequests;
