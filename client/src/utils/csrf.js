import api from '../services/api';

let csrfToken = null;

/**
 * Fetch CSRF token from server
 */
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

/**
 * Get current CSRF token
 */
export const getCsrfToken = () => csrfToken;

/**
 * Set CSRF token
 */
export const setCsrfToken = (token) => {
  csrfToken = token;
};

/**
 * Initialize CSRF protection by fetching token
 */
export const initializeCsrfProtection = async () => {
  await fetchCsrfToken();
};

/**
 * Add CSRF token to request headers
 */
export const addCsrfToHeaders = (headers = {}) => {
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  return headers;
};
