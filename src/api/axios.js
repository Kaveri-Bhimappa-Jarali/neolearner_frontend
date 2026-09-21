import axios from 'axios';

// Get base URL from environment variable or default to local backend API
let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Strip any trailing slashes
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');

let baseURL = 'http://localhost:8000/api';

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
