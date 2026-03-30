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
 * Refresh access token using refresh token (httpOnly cookie)
 * Exported so DashboardLayout can rehydrate the WS token on page refresh.
 */
export const refreshAccessToken = async () => {
  const refreshToken = tokenManager.getRefreshToken();
  // We include the refresh token in the body as fallback, but also include credentials for cookies.
  const body = refreshToken ? JSON.stringify({ refresh: refreshToken }) : '{}';

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body,
  });

  if (!response.ok) {
    tokenManager.clearTokens();
    throw new ApiError('Session expired. Please login again.', 401, 'session_expired');
  }

  const data = await response.json();
  const newAccess = data.access || null;
  const newRefresh = data.refresh || refreshToken; // fallback to old if not rotated
  
  if (newAccess) {
    tokenManager.setTokens(newAccess, newRefresh);
  }
  
  return newAccess;
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
      retries = 1,
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

    let lastError;

    // Retry loop with exponential backoff
    // Each iteration creates a fresh AbortController so a timeout on one
    // attempt does not poison the signal for subsequent retries.
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
          credentials: 'include',  // sends httpOnly auth cookies on every request
        });
        clearTimeout(timeoutId);

        // Handle 401 - Token expired
        if (response.status === 401 && !skipAuth) {
          const newToken = await this.handleTokenRefresh();
          if (newToken) {
            // Retry request with new token and a fresh controller
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
            try {
              const retryResponse = await fetch(url, {
                ...fetchOptions,
                headers,
                signal: retryController.signal,
                credentials: 'include',
              });
              clearTimeout(retryTimeoutId);
              return await this.handleResponse(retryResponse);
            } catch (retryError) {
              clearTimeout(retryTimeoutId);
              throw retryError;
            }
          }
        }

        return await this.handleResponse(response);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
        // Also don't retry if it's a known auth error or 404
        if (
          (error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500 &&
            error.status !== 408 &&
            error.status !== 429) ||
          [401, 403, 404].includes(error.status)
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

      // Dispatch token refreshed event (for UI notifications if needed)
      window.dispatchEvent(
        new CustomEvent('auth:token_refreshed', {
          detail: { timestamp: Date.now() }
        })
      );

      return token;
    } catch (error) {
      processQueue(error, null);
      // Only fire auth:logout when a session actually expired (had a refresh token
      // but the server rejected it). Don't fire for guests with no token at all.
      if (error.code !== 'no_refresh_token') {
        window.dispatchEvent(
          new CustomEvent('auth:logout', {
            detail: { reason: 'session_expired', error: error.message }
          })
        );
      }
      throw error;
    } finally {
      isRefreshing = false;
    }
  },

  /**
   * Extract clean error message from various API response formats
   */
  extractErrorMessage(data) {
    if (!data) return 'An error occurred';

    // Standard API error format: { success: false, error: { message: '...' } }
    if (data.error?.message) {
      return data.error.message;
    }

    // DRF detail format: { detail: '...' } or { detail: ['...'] }
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail[0] || 'An error occurred';
      }
      return data.detail;
    }

    // Non-field errors: { non_field_errors: ['...'] }
    if (data.non_field_errors) {
      if (Array.isArray(data.non_field_errors)) {
        return data.non_field_errors[0] || 'An error occurred';
      }
      return data.non_field_errors;
    }

    // Field-level errors: { field_name: ['error message'] }
    // Return the first field error
    const fieldKeys = Object.keys(data).filter(key =>
      !['success', 'error', 'code', 'type'].includes(key)
    );
    if (fieldKeys.length > 0) {
      const firstError = data[fieldKeys[0]];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return `${fieldKeys[0]}: ${firstError[0]}`;
      }
      if (typeof firstError === 'string') {
        return `${fieldKeys[0]}: ${firstError}`;
      }
    }

    // Generic error message
    if (data.message) {
      return data.message;
    }

    return 'An error occurred';
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
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMessage = this.extractErrorMessage(data);
      const errorCode = data?.error?.code || data?.code || response.status;
      const errorDetails = data?.error?.details || null;

      throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
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
   * Includes token refresh handling for expired tokens
   */
  async upload(endpoint, formData, options = {}) {
    const makeUploadRequest = async () => {
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
        credentials: 'include',  // sends httpOnly auth cookies on every upload
        ...options,
      });

      return response;
    };

    let response = await makeUploadRequest();

    // Handle 401 - Token expired: refresh and retry once
    if (response.status === 401) {
      const newToken = await this.handleTokenRefresh();
      if (newToken) {
        response = await makeUploadRequest();
      }
    }

    return this.handleResponse(response);
  },
};

export default apiClient;
