import api from './api'; // Axios instance setup

// Submit a new request
export const submitServiceRequest = async (requestData) => {
  try {
    const response = await api.post('/requests', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error submitting request';
  }
};

// Get all requests for the logged-in user
export const getUserRequests = async () => {
  try {
    const response = await api.get('/requests/my-requests');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error fetching history';
  }
};