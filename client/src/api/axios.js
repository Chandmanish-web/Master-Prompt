import axios from 'axios';

const configuredBase = import.meta.env.VITE_API_URL;
const baseURL = configuredBase || '/api';

if (!configuredBase) {
  console.warn('VITE_API_URL is not defined; falling back to relative "/api". Set VITE_API_URL for production.');
}

const getStoredToken = () => {
  try {
    const stored = localStorage.getItem('worktrack-auth');
    if (!stored) return null;
    return JSON.parse(stored)?.token || null;
  } catch {
    return null;
  }
};

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

export default api;
