import axios from "axios";
import { addCsrfToHeaders } from "../utils/csrf";

const resolveBaseURL = () => {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }
  // Dev: use Vite proxy (see vite.config.js) so requests stay on the page origin (no CORS)
  if (import.meta.env.DEV) {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

// Add request interceptor to include CSRF token
api.interceptors.request.use((config) => {
  // Only add CSRF token for state-changing methods, but exclude auth routes
  const isAuthRoute = config.url?.includes('/auth/');
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase());
  
  if (isStateChanging && !isAuthRoute) {
    config.headers = {
      ...config.headers,
      ...addCsrfToHeaders(),
    };
  }
  return config;
});

// Add response interceptor to handle CSRF errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.code === 'EBADCSRFTOKEN') {
      // CSRF token invalid, clear it and redirect to login
      console.error('CSRF token validation failed');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
