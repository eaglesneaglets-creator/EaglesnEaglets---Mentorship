/**
 * Authentication Store
 * Manages user authentication state with Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient, tokenManager } from '@api';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  // Access token kept in memory only (not localStorage) — used for WebSocket ?token= param.
  // httpOnly cookie is the primary auth mechanism for HTTP requests.
  accessToken: null,
};

/**
 * Map error codes/messages to user-friendly messages
 */
const getErrorMessage = (error) => {
  // Handle AbortError (request cancelled/timeout)
  if (error.name === 'AbortError') {
    return 'Request was cancelled. Please try again.';
  }

  // Use the error message directly if it's already user-friendly
  const message = error.message || error.detail || 'An error occurred';

  // Map common error patterns to friendlier messages
  const errorMappings = {
    'Invalid email or password': 'Invalid email or password. Please check your credentials and try again.',
    'Account is temporarily locked': 'Your account is temporarily locked due to too many failed attempts. Please try again later.',
    'This account has been deactivated': 'This account has been deactivated. Please contact support.',
    'Please verify your email': 'Please verify your email address before logging in. Check your inbox for the verification link.',
    'No active account': 'No account found with these credentials.',
    'Network Error': 'Unable to connect to the server. Please check your internet connection.',
    'timeout': 'Request timed out. Please try again.',
    'Session expired': 'Your session has expired. Please log in again.',
    'created with Google Sign-In': 'This account uses Google Sign-In. Please click "Continue with Google" to log in.',
    'signal is aborted': 'Request was cancelled. Please try again.',
    'An unexpected error occurred': 'Something went wrong on our end. Please try again in a moment.',
    'An error occurred': 'Something went wrong. Please try again.',
  };

  // Check for partial matches
  for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }

  return message;
};

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Login user with email and password
         */
        login: async (email, password) => {
          // Prevent double submission
          if (get().isLoading) {
            return null;
          }

          set({ isLoading: true, error: null });

          try {
            const response = await apiClient.post('/auth/login/', { email, password }, { skipAuth: true });

            // Backend sets httpOnly cookies for HTTP auth.
            // access token is also returned in body for WebSocket ?token= param only.
            const data = response.data || response;
            const user = data.user || data;
            const accessToken = data.access || null;

            // Store access token in memory for WS use; NOT in localStorage
            if (accessToken) {
              tokenManager.setTokens(accessToken, null);
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              accessToken,
            });

            return user;
          } catch (error) {
            // Don't show error if request was aborted (user navigated away)
            if (error.name === 'AbortError') {
              set({ isLoading: false });
              return null;
            }

            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Register new user
         */
        register: async (userData) => {
          // Prevent double submission
          if (get().isLoading) {
            return null;
          }

          set({ isLoading: true, error: null });

          try {
            const response = await apiClient.post('/auth/register/', userData, {
              skipAuth: true,
              timeout: 60000, // 60 seconds for registration (may be slower due to email sending)
            });

            set({ isLoading: false, error: null });

            return response.data || response;
          } catch (error) {
            // Don't show error if request was aborted (user navigated away)
            if (error.name === 'AbortError') {
              set({ isLoading: false });
              return null;
            }

            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Logout user
         */
        logout: async () => {
          try {
            // Backend reads refresh token from httpOnly cookie — no body needed
            await apiClient.post('/auth/logout/', {});
          } catch (error) {
            // Continue with logout even if API call fails
            console.error('Logout API error:', error);
          }

          // Clear any residual localStorage tokens and reset state
          tokenManager.clearTokens();
          set(initialState);

          // Dispatch event for other components to react
          window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'user_initiated' } }));
        },

        /**
         * Fetch current user profile
         */
        fetchUser: async () => {
          // With httpOnly cookies, we can't check localStorage for a token.
          // The cookie is sent automatically — just attempt the request.
          // Only skip if we already have a user loaded in state.
          if (get().user) {
            return get().user;
          }

          set({ isLoading: true });

          try {
            const response = await apiClient.get('/auth/me/');
            const user = response.data || response;

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });

            return user;
          } catch (error) {
            // If unauthorized, clear auth state
            if (error.status === 401) {
              tokenManager.clearTokens();
              set(initialState);
            } else {
              set({ isLoading: false });
            }
            return null;
          }
        },

        /**
         * Update user profile
         */
        updateProfile: async (data) => {
          set({ isLoading: true, error: null });

          try {
            const response = await apiClient.patch('/auth/me/', data);
            const user = response.data || response;

            set({
              user,
              isLoading: false,
            });

            return user;
          } catch (error) {
            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Change password
         */
        changePassword: async (oldPassword, newPassword, newPasswordConfirm) => {
          set({ isLoading: true, error: null });

          try {
            await apiClient.post('/auth/password/change/', {
              old_password: oldPassword,
              new_password: newPassword,
              new_password_confirm: newPasswordConfirm,
            });

            set({ isLoading: false });

            return true;
          } catch (error) {
            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Request password reset email
         */
        requestPasswordReset: async (email) => {
          set({ isLoading: true, error: null });

          try {
            await apiClient.post('/auth/password/reset/', { email }, { skipAuth: true });
            set({ isLoading: false });
            return true;
          } catch (error) {
            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Confirm password reset with token
         */
        confirmPasswordReset: async (token, newPassword, newPasswordConfirm) => {
          set({ isLoading: true, error: null });

          try {
            await apiClient.post(
              '/auth/password/reset/confirm/',
              {
                token,
                new_password: newPassword,
                new_password_confirm: newPasswordConfirm,
              },
              { skipAuth: true }
            );
            set({ isLoading: false });
            return true;
          } catch (error) {
            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Verify email with token
         */
        verifyEmail: async (token) => {
          set({ isLoading: true, error: null });

          try {
            await apiClient.post('/auth/email/verify/', { token }, { skipAuth: true });
            set({ isLoading: false });
            return true;
          } catch (error) {
            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Resend verification email (no auth required)
         */
        resendVerification: async (email) => {
          set({ isLoading: true, error: null });

          try {
            await apiClient.post('/auth/email/resend/', { email }, { skipAuth: true });
            set({ isLoading: false });
            return true;
          } catch (error) {
            const friendlyMessage = getErrorMessage(error);
            set({
              isLoading: false,
              error: friendlyMessage,
            });
            throw error;
          }
        },

        /**
         * Rehydrate access token in memory (called on dashboard mount after page refresh)
         */
        setAccessToken: (token) => set({ accessToken: token }),

        /**
         * Clear any errors
         */
        clearError: () => set({ error: null }),

        /**
         * Set auth state directly (used for OAuth callbacks)
         */
        setAuth: ({ accessToken, refreshToken, user }) => {
          // Store access token in memory for WS; httpOnly cookie is set by backend
          if (accessToken) {
            tokenManager.setTokens(accessToken, refreshToken);
          }
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            accessToken: accessToken || null,
          });
        },

        /**
         * Check if user has specific role
         */
        hasRole: (role) => {
          const user = get().user;
          return user?.role === role;
        },

        /**
         * Check if user is an Eagle (mentor)
         */
        isEagle: () => get().hasRole('eagle'),

        /**
         * Check if user is an Eaglet (mentee)
         */
        isEaglet: () => get().hasRole('eaglet'),

        /**
         * Check if user is an admin
         */
        isAdmin: () => {
          const user = get().user;
          return user?.role === 'admin' || user?.is_staff;
        },
      }),
      {
        name: 'auth-storage',
        // Only persist user and isAuthenticated — never persist tokens
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Listen for logout events from other parts of the app
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', (event) => {
    const store = useAuthStore.getState();
    if (event.detail?.reason === 'session_expired' && store.isAuthenticated) {
      tokenManager.clearTokens();
      useAuthStore.setState(initialState);
    }
  });
}
