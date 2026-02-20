import React, { useState } from 'react';
import WorkRequests from '../components/worker/WorkRequests';
import WorkPending from '../components/worker/WorkPending';
import WorkCompleted from '../components/worker/WorkCompleted';
import NotificationCenter from '../components/NotificationCenter';

const WorkerDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAction = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight font-outfit">Worker Dashboard</h1>
                    <p className="text-gray-500 font-medium font-outfit">Manage pickups and track your earnings</p>
                </div>
                <NotificationCenter />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/50 backdrop-blur-md rounded-2xl mb-8 w-fit border border-gray-100">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'requests'
                            ? 'bg-white text-green-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Work Requests
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'pending'
                            ? 'bg-white text-green-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Work Pending
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'completed'
                            ? 'bg-white text-green-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Work Completed
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'requests' && <WorkRequests onAction={handleAction} />}
                {activeTab === 'pending' && <WorkPending onAction={handleAction} />}
                {activeTab === 'completed' && <WorkCompleted refreshTrigger={refreshTrigger} />}
            </div>
        </div>
    );
};

export default WorkerDashboard;
