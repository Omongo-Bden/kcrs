import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');
const baseMediaURL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${baseMediaURL}${path}`;
};

const api = axios.create({
  baseURL,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
