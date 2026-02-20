import axios from 'axios';
import supabase from '../config/supabaseClient';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically add the token to requests if we are logged in
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;