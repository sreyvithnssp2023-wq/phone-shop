import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

// 🟢 Smart Base URL detection for MySQL Laravel backend
export const DEFAULT_API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  (isLocalhost
    ? 'http://localhost/phone-shop/Backend/public/api'
    : 'https://phone-shop-1-o2d6.onrender.com/api');

export const CANDIDATE_API_URLS = [
  process.env.REACT_APP_API_BASE_URL,
  ...(isLocalhost
    ? [
        'http://localhost/phone-shop/Backend/public/api',
        'http://localhost:8000/api',
        'http://127.0.0.1/phone-shop/Backend/public/api',
        'https://phone-shop-1-o2d6.onrender.com/api',
      ]
    : [
        'https://phone-shop-1-o2d6.onrender.com/api',
        'http://localhost/phone-shop/Backend/public/api',
        'http://localhost:8000/api',
      ]),
].filter(Boolean);

let cachedWorkingBaseUrl = null;

/**
 * Fetch from API with automatic fallback across known endpoints.
 * Includes a resilient 10s timeout for slower database queries.
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If we already know a working base URL, try it first
  if (cachedWorkingBaseUrl) {
    try {
      const res = await axios({
        url: `${cachedWorkingBaseUrl}${cleanEndpoint}`,
        timeout: options.timeout || 10000,
        ...options,
      });
      return res;
    } catch (err) {
      console.warn(`Request failed on cached URL ${cachedWorkingBaseUrl}, checking fallback URLs...`);
    }
  }

  // Iterate over candidate URLs until one works
  let lastError = null;
  for (const baseUrl of CANDIDATE_API_URLS) {
    try {
      const res = await axios({
        url: `${baseUrl}${cleanEndpoint}`,
        timeout: options.timeout || 10000,
        ...options,
      });
      cachedWorkingBaseUrl = baseUrl;
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

export function getApiBase() {
  return cachedWorkingBaseUrl || DEFAULT_API_BASE;
}

/**
 * Helper to resolve product and asset image URLs consistently
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
  const baseHost = getApiBase().replace(/\/api\/?$/, '');
  return `${baseHost}/${cleanPath}`;
}

export const api = {
  get: (url, config) => apiFetch(url, { ...config, method: 'GET' }),
  post: (url, data, config) => apiFetch(url, { ...config, method: 'POST', data }),
  put: (url, data, config) => apiFetch(url, { ...config, method: 'PUT', data }),
  delete: (url, config) => apiFetch(url, { ...config, method: 'DELETE' }),
};

export default apiFetch;
