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

/** Access tokens live in memory; refresh tokens are cookie-only. */
let _accessToken = null;
let _csrfToken = null;
let _csrfPromise = null;

// Remove refresh credentials persisted by older frontend releases. This is a
// one-way migration: current code never writes refresh tokens to Web Storage.
try {
  localStorage.removeItem('ee_refresh_token');
} catch {
  // Storage can be unavailable in privacy-restricted browser contexts.
}

const getCsrfToken = async () => {
  if (_csrfToken) return _csrfToken;
  if (_csrfPromise) return _csrfPromise;

  _csrfPromise = fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new ApiError('Unable to initialize request security.', response.status, 'csrf_init_failed');
      }
      const data = await response.json();
      _csrfToken = data.csrf_token;
      return _csrfToken;
    })
    .finally(() => {
      _csrfPromise = null;
    });

  return _csrfPromise;
};

/**
 * Listeners notified whenever the access token changes.
 *
 * Why this exists: HTTP requests read the token from this module at call time,
 * so they always use the current one. **WebSockets do not** — the token is baked
 * into the connection URL (`?token=…`) at connect time, because browsers block
 * cross-site cookies on WS upgrades.
 *
 * Before this, a silent refresh updated `_accessToken` here but never the auth
 * store, whose copy was only ever set once on mount. After ~15 minutes (the
 * access-token lifetime) any WS reconnect rebuilt its URL from that stale store
 * value, the server rejected it with 4001, and `useWebSocket` treats 4001 as
 * terminal — so chat/notifications stayed dead until a full page reload.
 */
const _tokenListeners = new Set();

function _notifyTokenChange(token) {
  for (const listener of _tokenListeners) {
    try {
      listener(token);
    } catch {
      // A misbehaving listener must never break token refresh.
    }
  }
}

export const tokenManager = {
  getAccessToken: () => _accessToken,

  /**
   * Subscribe to access-token changes.
   *
   * The auth store registers here so `store.accessToken` tracks the *current*
   * token rather than whatever was present at page load. That matters because
   * WebSocket URLs embed `?token=` — see the note on `_notifyTokenChange`.
   *
   * A callback (rather than importing the store here) keeps the dependency
   * one-directional: `auth-store` imports `@api`, so `@api` must never import
   * `auth-store` back.
   *
   * @returns {() => void} unsubscribe
   */
  onTokenChange: (listener) => {
    _tokenListeners.add(listener);
    return () => _tokenListeners.delete(listener);
  },

  /** Set the short-lived access token in memory only. */
  setTokens: (accessToken) => {
    if (accessToken) {
      _accessToken = accessToken;
    }
    if (accessToken) {
      _notifyTokenChange(accessToken);
    }
  },

  clearTokens: () => {
    _accessToken = null;
    _csrfToken = null;
    _notifyTokenChange(null);
  },

  isAuthenticated: () => !!_accessToken,
};

/**
 * Refresh the access token using the cookie-only refresh credential.
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
    const accessToken = tokenManager.getAccessToken();

    if (!accessToken && !hasPersistedAuthSession()) {
      throw new ApiError('No refresh token available.', 401, 'no_refresh_token');
    }

    const csrfToken = await getCsrfToken();

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      throw new ApiError('Session expired. Please login again.', 401, 'session_expired');
    }

    const data = await response.json();
    const newAccess = data.access || null;
    if (newAccess) {
      tokenManager.setTokens(newAccess);
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

    const method = (fetchOptions.method || 'GET').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      headers['X-CSRFToken'] = await getCsrfToken();
    }

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

        // Don't retry client errors. A 429 explicitly tells the client to stop;
        // retrying here consumes more of the same throttle bucket before the
        // caller has a chance to surface the Retry-After guidance.
        // 408 remains retryable because it represents a transient timeout.
        // Also don't retry if it's a known auth error or 404
        if (
          (error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500 &&
            error.status !== 408) ||
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

      // Account suspended (BE sends 403 + error_code 'account_suspended').
      // Handled here so EVERY call site behaves identically: clear the session
      // and send the user to a page that explains what happened. Deliberately
      // NOT a 401 — that path auto-refreshes, and for a suspended user the
      // refresh succeeds (refresh token is still valid) then fails again,
      // looping until they're dumped at /login with no explanation.
      if (response.status === 403 && data?.error?.error_code === 'account_suspended') {
        this.handleAccountSuspended();
      }

      // 429: rewrite DRF's developer-facing text ("Request was throttled.
      // Expected available in 10 seconds.") into something a member can act on.
      // Callers still get a normal rejected promise — React Query is configured
      // not to retry 429 — so the UI keeps whatever data it already had rather
      // than blanking the route.
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? ` Try again in ${retryAfter} second${retryAfter === 1 ? '' : 's'}.`
          : ' Please try again shortly.';
        throw new ApiError(
          `You're going a bit fast for us.${wait}`,
          429,
          errorCode,
          errorDetails,
        );
      }

      throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
    }

    return data;
  },

  /**
   * Tear down the session and route to the suspended notice.
   * Idempotent — concurrent in-flight requests may each hit a 403.
   *
   * CRITICAL: the auth tokens live in **httpOnly cookies**, which JavaScript
   * cannot delete — only a server response carrying an expiring Set-Cookie can.
   * So clearing local state is not enough: we must call the logout endpoint
   * (exempted from the suspension block server-side) or the browser keeps
   * sending valid suspended-user cookies forever. That previously caused the
   * /suspended page to reappear on any navigation AND hijacked a *different*
   * person signing in on the same browser.
   */
  handleAccountSuspended() {
    if (typeof window === 'undefined') return;
    if (this._suspensionTeardownStarted) return;
    if (window.location.pathname === '/suspended') return;
    this._suspensionTeardownStarted = true;

    const finish = () => {
      try {
        window.dispatchEvent(
          new CustomEvent('auth:logout', { detail: { reason: 'account_suspended' } })
        );
      } catch {
        // Never let teardown errors mask the original API error.
      }
      // Hard redirect (not react-router) — this runs outside component context
      // and we want a clean slate with no stale authenticated state in memory.
      window.location.replace('/suspended');
    };

    // Server-side cookie deletion, then redirect either way — a failed logout
    // must not strand the user on a broken page.
    getCsrfToken()
      .then((csrfToken) => fetch(`${this.baseURL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      }))
      .catch(() => { /* offline / network error — still tear down locally */ })
      .finally(finish);
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
      const csrfToken = await getCsrfToken();
      const headers = { 'X-CSRFToken': csrfToken, ...options.headers };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Don't set Content-Type - let browser set it with boundary
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',  // sends httpOnly auth cookies on every upload
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
