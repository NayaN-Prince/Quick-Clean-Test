import React, { useState } from 'react';
import RequestForm from '../components/user/RequestForm';
import RequestList from '../components/user/RequestList';
import NotificationCenter from '../components/NotificationCenter';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('request');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRequestSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setActiveTab('track');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Dashboard</h1>
                    <p className="text-gray-500 font-medium">Manage your garbage collection requests</p>
                </div>
                <NotificationCenter />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 w-fit">
                <button
                    onClick={() => setActiveTab('request')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'request'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Request Pickup
                </button>
                <button
                    onClick={() => setActiveTab('track')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'track'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Track My Requests
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'request' ? (
                    <RequestForm onSuccess={handleRequestSuccess} />
                ) : (
                    <RequestList refreshTrigger={refreshTrigger} />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
