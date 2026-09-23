import axios from 'axios';

// Get base URL from environment variable
let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Strip any trailing slashes
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');

// Default to relative /api in production or http://localhost:8000/api in local dev
let baseURL = '/api';

if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  baseURL = 'http://localhost:8000/api';
}

if (rawBaseUrl) {
  if (rawBaseUrl.endsWith('/api')) {
    baseURL = rawBaseUrl;
  } else {
    baseURL = `${rawBaseUrl}/api`;
  }
}

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
