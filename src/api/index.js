/**
 * API Client Configuration
 * Production-ready API client with:
 * - Automatic token refresh
 * - Request retry with exponential backoff
 * - Request/response interceptors
 * - Comprehensive error handling
 */

// Relative base — dev: vite.config.js proxies /api -> backend; prod: vercel.json rewrites /api/* -> Railway.
// Both routes make FE+BE same-origin so the httpOnly refresh cookie is first-party (not blocked by browsers).
// VITE_API_URL still honored as escape hatch for non-proxied deployments (e.g. mobile webview, Storybook).
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
class ApiError extends Error {
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
 * Token storage — temporary cross-origin localStorage model.
 *
 *  - ACCESS token lives in a module-level variable (in-memory only).
 *  - REFRESH token is stored in localStorage AND set as an httpOnly cookie
 *    by the backend. Whichever the browser accepts wins:
 *      * Same-origin (future): the cookie attaches automatically; localStorage
 *        becomes redundant.
 *      * Cross-origin (today, FE on Vercel + BE on Railway): the cookie is
 *        third-party and silently blocked, so the FE falls back to sending
 *        the localStorage value in the refresh body.
 *
 * SECURITY TRADE-OFF: localStorage is readable by XSS. The mitigation
 * is to flip back to cookie-only once the platform has a single parent
 * domain — see notes in apps/users/views/auth.py (P0 #1).
 */
let _accessToken = null;
const REFRESH_TOKEN_KEY = 'ee_refresh_token';

export const tokenManager = {
  getAccessToken: () => _accessToken,

  getRefreshToken: () => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Set the in-memory access token and, if provided, persist the refresh
   * token to localStorage so it survives page refresh.
   */
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      _accessToken = accessToken;
    }
    if (refreshToken) {
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } catch {
        // localStorage unavailable (private browsing, quota, etc.)
      }
    }
  },

  clearTokens: () => {
    _accessToken = null;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  isAuthenticated: () => !!_accessToken,
};

/**
 * Refresh access token — sends the localStorage refresh value in the body
 * AND lets the browser attach the httpOnly cookie (if it survives the
 * cross-origin trip). Backend reads either source, rotates the token,
 * sets a new cookie, AND returns the rotated refresh in JSON so we can
 * keep localStorage in sync.
 *
 * Guests with no credentials throw no_refresh_token (no network call).
 * A 401 from the refresh endpoint means the session expired — clear local
 * state and treat as session_expired.
 *
 * Single-flight concurrency control: concurrent callers await the same
 * promise. Prevents races against ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_
 * ROTATION where a second refresh would use the already-blacklisted token.
 */
let _refreshPromise = null;

const AUTH_STORAGE_KEY = 'auth-storage';

/** True when Zustand persist says the user was logged in (cookie may still exist). */
const hasPersistedAuthSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.state?.isAuthenticated === true;
  } catch {
    return false;
  }
};

export const refreshAccessToken = async () => {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    // Cookie-primary: the httpOnly refresh cookie is the source of truth and is
    // attached automatically via credentials:'include'. The localStorage value
    // is a dormant fallback for cross-origin edge cases (Safari ITP, proxies) —
    // we send it in the body when present, but its ABSENCE must NOT block the
    // refresh when a session likely exists (in-memory access or persisted login).
    // Guests with none of those signals skip the network call so handleTokenRefresh
    // can throw no_refresh_token instead of session_expired (no spurious logout).
    const refreshToken = tokenManager.getRefreshToken();
    const accessToken = tokenManager.getAccessToken();

    if (!refreshToken && !accessToken && !hasPersistedAuthSession()) {
      throw new ApiError('No refresh token available.', 401, 'no_refresh_token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // attaches the httpOnly refresh cookie (primary)
      body: JSON.stringify(refreshToken ? { refresh: refreshToken } : {}),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      throw new ApiError('Session expired. Please login again.', 401, 'session_expired');
    }

    const data = await response.json();
    const newAccess = data.access || null;
    const newRefresh = data.refresh || null;

    if (newAccess) {
      tokenManager.setTokens(newAccess, newRefresh);
    }

    return newAccess;
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
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
