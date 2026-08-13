import axios from 'axios';

const configuredBase = import.meta.env.VITE_API_URL;
const fallbackBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';
const baseURL = configuredBase || fallbackBase;

if (!configuredBase) {
  console.warn('VITE_API_URL is not defined; using fallback API base:', baseURL);
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
