import React, { useState, useEffect, useContext } from 'react';
import { getUserRequests } from '../../services/supabaseRequestService';
import { AuthContext } from '../../context/AuthContext';
import { generateInvoice } from '../../utils/invoiceGenerator';

const RequestList = ({ refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user, refreshTrigger]);

    const loadRequests = async () => {
        try {
            const data = await getUserRequests(user.id);
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In Progress': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading requests...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Track Requests</h3>

            {requests.length === 0 ? (
                <div className="bg-white p-10 rounded-xl text-center border-2 border-dashed border-gray-200 text-gray-400">
                    No requests found. Start by creating one above!
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                        <img
                                            src={req.image_url || 'https://via.placeholder.com/150'}
                                            alt="Waste"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-gray-400">#{req.id.slice(0, 8)}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-800">{req.garbage_type} Waste</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{req.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                    <div className="text-right">
                                        <p className="text-lg font-black text-gray-900">₹{parseFloat(req.estimated_price).toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => generateInvoice({
                                                ...req,
                                                request_id: req.id,
                                                price: req.estimated_price,
                                                weight: req.weight_kg,
                                                users: { name: user.user_metadata?.full_name || 'User', email: user.email }
                                            })}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                                            title="Download Invoice"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </button>

                                        {req.status === 'Completed' && (
                                            <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                                Feedback
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {req.worker_id && (
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Worker Assigned</p>
                                        <p className="text-xs text-gray-700 font-semibold">Worker-ID: {req.worker_id.slice(0, 8)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestList;
