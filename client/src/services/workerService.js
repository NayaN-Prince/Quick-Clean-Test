import api from './api';

// Fetch all available pending jobs
export const fetchAvailableJobs = async () => {
  try {
    const response = await api.get('/worker/available-jobs');
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching jobs';
  }
};

// Accept a specific job
export const acceptJobRequest = async (jobId) => {
  try {
    const response = await api.put(`/worker/accept-job/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error accepting job';
  }
};