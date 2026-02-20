import React, { useState, useEffect, useContext } from 'react';
import { getWorkerRequests, updateRequestStatus, completeRequest } from '../../services/supabaseWorkerService';
import { uploadGarbageImage } from '../../services/supabaseRequestService';
import { AuthContext } from '../../context/AuthContext';

const WorkPending = ({ onAction }) => {
    const { user } = useContext(AuthContext);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completingId, setCompletingId] = useState(null);
    const [completionData, setCompletionData] = useState({
        time: '',
        image: null,
        preview: null
    });

    useEffect(() => {
        if (user) loadPendingJobs();
    }, [user]);

    const loadPendingJobs = async () => {
        try {
            const data = await getWorkerRequests(user.id);
            setPendingJobs(data.filter(j => j.status === 'Accepted' || j.status === 'In Progress'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartWork = async (id) => {
        try {
            await updateRequestStatus(id, 'In Progress');
            loadPendingJobs();
        } catch (err) {
            alert('Error starting work');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompletionData({
                ...completionData,
                image: file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleComplete = async (id, estimatedPrice) => {
        if (!completionData.image || !completionData.time) {
            return alert('Please upload a "cleaned area" photo and enter time taken.');
        }

        try {
            setLoading(true);
            const afterImageUrl = await uploadGarbageImage(completionData.image);
            await completeRequest(id, {
                after_image_url: afterImageUrl,
                completion_time_minutes: parseInt(completionData.time),
                final_earning: parseFloat(estimatedPrice) * 0.7 // Worker gets 70%
            });

            setCompletingId(null);
            setCompletionData({ time: '', image: null, preview: null });
            loadPendingJobs();
            if (onAction) onAction();
            alert('Work marked as Completed! Your earnings have been updated.');
        } catch (err) {
            console.error('Work completion failed:', err);
            alert('Error completing work: ' + (err.message || JSON.stringify(err)));
        } finally {
            setLoading(false);
        }
    };

    if (loading && pendingJobs.length === 0) return <div className="text-center py-10 text-gray-400">Loading pending work...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-outfit">Active Assignments</h3>
            {pendingJobs.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center border-2 border-dashed border-gray-100 text-gray-400">
                    No active assignments. Accept a job from the "Work Requests" tab!
                </div>
            ) : (
                <div className="space-y-6">
                    {pendingJobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                            {/* Status Bar */}
                            <div className={`absolute top-0 left-0 h-1 transition-all ${job.status === 'In Progress' ? 'w-full bg-indigo-500' : 'w-1/3 bg-blue-500'}`}></div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img src={job.image_url} className="w-full h-full object-cover" alt="Waste" />
                                </div>

                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-bold text-gray-900">{job.address}</h4>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${job.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Type</p>
                                            <p className="text-sm font-bold text-gray-700">{job.garbage_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Weight</p>
                                            <p className="text-sm font-bold text-gray-700">{job.weight_kg} KG</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Reward</p>
                                            <p className="text-sm font-bold text-green-600">₹{(parseFloat(job.estimated_price) * 0.7).toFixed(0)}</p>
                                        </div>
                                    </div>

                                    {completingId === job.id ? (
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-4 animate-in fade-in zoom-in duration-300">
                                            <p className="text-sm font-bold text-gray-700 mb-2">Complete Final Steps</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase">After Photo (Cleaned)</label>
                                                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-white transition-colors overflow-hidden">
                                                        {completionData.preview ? (
                                                            <img src={completionData.preview} className="w-full h-full object-cover" alt="After" />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Click to capture</span>
                                                        )}
                                                        <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                                                    </label>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase">Completion Time (Mins)</label>
                                                    <input
                                                        type="number"
                                                        value={completionData.time}
                                                        onChange={(e) => setCompletionData({ ...completionData, time: e.target.value })}
                                                        placeholder="e.g. 20"
                                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setCompletingId(null)}
                                                            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleComplete(job.id, job.estimated_price)}
                                                            className="flex-[2] py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            {job.status === 'Accepted' ? (
                                                <button
                                                    onClick={() => handleStartWork(job.id)}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-100"
                                                >
                                                    Start Work
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setCompletingId(job.id)}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-100"
                                                >
                                                    Submit for Completion
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkPending;
