/**
 * API Client Configuration
 * Production-ready API client with:
 * - Automatic token refresh
 * - Request retry with exponential backoff
 * - Request/response interceptors
 * - Comprehensive error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Request queue for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Sleep function for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Token management utilities
 */
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401, 'no_refresh_token');
  }

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    tokenManager.clearTokens();
    throw new ApiError('Session expired. Please login again.', 401, 'session_expired');
  }

  const data = await response.json();
  tokenManager.setTokens(data.access, data.refresh);
  return data.access;
};

/**
 * Main API client
 */
export const apiClient = {
  baseURL: API_BASE_URL,

  /**
   * Core request method with retry logic and token refresh
   */
  async request(endpoint, options = {}) {
    const {
      retries = 3,
      retryDelay = 1000,
      skipAuth = false,
      timeout = 30000,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;

    // Build headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header
    if (!skipAuth) {
      const token = tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    };

    let lastError;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle 401 - Token expired
        if (response.status === 401 && !skipAuth) {
          const newToken = await this.handleTokenRefresh();
          if (newToken) {
            // Retry request with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...config, headers });
            return await this.handleResponse(retryResponse);
          }
        }

        return await this.handleResponse(response);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 408 &&
          error.status !== 429
        ) {
          throw error;
        }

        // Don't retry if we've exhausted attempts
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await sleep(delay);
      }
    }

    throw lastError;
  },

  /**
   * Handle token refresh with queue management
   */
  async handleTokenRefresh() {
    if (isRefreshing) {
      // Wait for the refresh to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      const token = await refreshAccessToken();
      processQueue(null, token);
      return token;
    } catch (error) {
      processQueue(error, null);
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'session_expired' } }));
      throw error;
    } finally {
      isRefreshing = false;
    }
  },

  /**
   * Handle response and errors
   */
  async handleResponse(response) {
    let data;

    try {
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = null;
      }
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.detail || 'An error occurred';
      const errorCode = data?.error?.code || data?.code || response.status;

      throw new ApiError(errorMessage, response.status, errorCode, data?.error?.details);
    }

    return data;
  },

  // HTTP method helpers
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Upload files with multipart form data
   */
  async upload(endpoint, formData, options = {}) {
    const token = tokenManager.getAccessToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type - let browser set it with boundary
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...options,
    });

    return this.handleResponse(response);
  },
};

export default apiClient;
