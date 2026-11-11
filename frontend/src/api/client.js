import axios from 'axios';
import { getCookie } from '../utils/auth';

/**
 * Production API base URL.
 * - In production (Vercel), REACT_APP_API_BASE_URL must be set to:
 *   https://phone-shop-2-nc9l.onrender.com/api
 * - In local development, it falls back to localhost:8000 only if the env var
 *   is not set AND the page is being served from localhost.
 */
const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

const envUrl = process.env.REACT_APP_API_BASE_URL;

// Only allow localhost fallback URLs when actually running on localhost
const safeEnvUrl =
  envUrl &&
  (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1'))
    ? envUrl // production URL — always use it
    : envUrl && isLocalhost
    ? envUrl // localhost URL is only OK when actually on localhost
    : null;

// Determine the API base:
// 1. Use the env var if it is a production URL (safest)
// 2. Fall back to localhost:8000 only when running locally
// 3. Hard-coded production URL as final fallback for Vercel builds
//    where the env var may have been forgotten
export const DEFAULT_API_BASE =
  safeEnvUrl ||
  (isLocalhost
    ? 'http://localhost:8000/api'
    : 'https://phone-shop-2-nc9l.onrender.com/api');

/**
 * Centralized axios API client.
 * All requests go through this single base URL — no fallback loops in production.
 */
const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// Add auth token to every request if available (checked from cookie, sessionStorage, or localStorage)
apiClient.interceptors.request.use((config) => {
  const token =
    getCookie('auth_token') ||
    sessionStorage.getItem('authToken') ||
    localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error response handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error(
        '[API] Cannot reach backend:',
        DEFAULT_API_BASE,
        '— Check that Render service is running.'
      );
    } else if (error.response) {
      console.error(
        '[API] Response error:',
        error.response.status,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

/**
 * apiFetch — drop-in replacement for the old fallback-based fetch.
 * Accepts the same options shape (method, data, headers, timeout).
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const { method = 'GET', data, headers, timeout, ...rest } = options;

  return apiClient({
    url: cleanEndpoint,
    method,
    data,
    headers,
    timeout,
    ...rest,
  });
}

/**
 * Returns the currently configured API base URL.
 * Used by components that build image URLs or direct axios calls.
 */
export function getApiBase() {
  return DEFAULT_API_BASE;
}

/**
 * Resolve a product image URL consistently regardless of storage path format.
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  let cleanPath = String(imagePath).replace(/^\/+/, '');
  if (!cleanPath.includes('/')) {
    cleanPath = `uploads/products/${cleanPath}`;
  }
  const baseHost = DEFAULT_API_BASE.replace(/\/api\/?$/, '');
  return `${baseHost}/${cleanPath}`;
}

export const api = {
  get: (url, config) => apiFetch(url, { ...config, method: 'GET' }),
  post: (url, data, config) => apiFetch(url, { ...config, method: 'POST', data }),
  put: (url, data, config) => apiFetch(url, { ...config, method: 'PUT', data }),
  delete: (url, config) => apiFetch(url, { ...config, method: 'DELETE' }),
};

export default apiClient;
