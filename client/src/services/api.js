import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecoclub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response body and handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const res = error.response;
    if (res && res.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('ecoclub_token');
        localStorage.removeItem('ecoclub_user');
        window.location.href = '/login?expired=true';
      }
    }
    const message =
      res?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
