import React, { useState, useEffect } from 'react';
import { fetchAvailableJobs, acceptJobRequest } from '../../services/workerService';
import { useNavigate } from 'react-router-dom';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await fetchAvailableJobs();
      setJobs(data);
    } catch (err) {
      setError('Failed to load available jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId) => {
    if (!window.confirm('Are you sure you want to accept this job?')) return;

    try {
      await acceptJobRequest(jobId);
      alert('Job Accepted!');
      
      // Remove the accepted job from the list immediately
      setJobs(jobs.filter(job => job._id !== jobId));
      
      // Optional: Navigate to active jobs page
      // navigate('/worker/accepted-jobs');
    } catch (err) {
      alert(err || 'Failed to accept job');
    }
  };

  if (loading) return <div className="text-center p-10">Loading jobs...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Available Pickups</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      
      {jobs.length === 0 ? (
        <div className="text-gray-500 text-center text-lg">No pending jobs available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Card Header */}
              <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                <span className="font-bold text-green-800">{job.wasteType} Waste</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  job.urgency === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {job.urgency}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-500 w-24 text-sm">Location:</span>
                  <span className="text-gray-800 font-medium truncate">{job.location?.address}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-500 w-24 text-sm">Quantity:</span>
                  <span className="text-gray-800">{job.quantity}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-gray-500 w-24 text-sm">Est. Price:</span>
                  <span className="text-green-600 font-bold">${job.estimatedPrice}</span>
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  Requested: {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => handleAccept(job._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Accept Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;