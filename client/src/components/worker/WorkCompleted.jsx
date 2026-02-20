import React, { useState, useEffect, useContext } from 'react';
import { getWorkerRequests } from '../../services/supabaseWorkerService';
import { AuthContext } from '../../context/AuthContext';

const WorkCompleted = ({ refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        if (user) loadHistory();
    }, [user, refreshTrigger]);

    const loadHistory = async () => {
        try {
            const data = await getWorkerRequests(user.id);
            const completed = data.filter(j => j.status === 'Completed');
            setCompletedJobs(completed);

            const total = completed.reduce((sum, job) => sum + (parseFloat(job.final_earning) || 0), 0);
            setTotalEarnings(total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading history...</div>;

    return (
        <div className="space-y-6">
            {/* Earnings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-100">
                    <p className="text-xs font-black uppercase tracking-wider opacity-80 mb-1">Total Earnings</p>
                    <p className="text-3xl font-black">₹{totalEarnings.toFixed(0)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Works Finished</p>
                        <p className="text-xl font-black text-gray-900">{completedJobs.length}</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2 font-outfit">Earnings History</h3>
            {completedJobs.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center border-2 border-dashed border-gray-100 text-gray-400">
                    No completed jobs yet. Keep cleaning!
                </div>
            ) : (
                <div className="space-y-4">
                    {completedJobs.map((job) => (
                        <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-gray-50 flex-shrink-0 z-10 shadow-sm">
                                            <img src={job.image_url} className="w-full h-full object-cover" title="Before" alt="Before" />
                                        </div>
                                        <div className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm">
                                            <img src={job.after_image_url} className="w-full h-full object-cover" title="After" alt="After" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 truncate w-40 md:w-64">{job.address}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                {new Date(job.updated_at).toLocaleDateString()}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                                                {job.completion_time_minutes} Mins
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end gap-1">
                                    <p className="text-lg font-black text-green-600">+₹{parseFloat(job.final_earning).toFixed(0)}</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <svg key={s} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkCompleted;
