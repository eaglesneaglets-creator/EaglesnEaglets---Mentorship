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
          set({ isLoading: true, error: null });

          try {
            const response = await apiClient.post('/auth/login/', { email, password }, { skipAuth: true });

            tokenManager.setTokens(response.access, response.refresh);

            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return response;
          } catch (error) {
            set({
              isLoading: false,
              error: error.message || 'Login failed',
            });
            throw error;
          }
        },

        /**
         * Register new user
         */
        register: async (userData) => {
          set({ isLoading: true, error: null });

          try {
            const response = await apiClient.post('/auth/register/', userData, { skipAuth: true });

            set({ isLoading: false, error: null });

            return response;
          } catch (error) {
            set({
              isLoading: false,
              error: error.message || 'Registration failed',
            });
            throw error;
          }
        },

        /**
         * Logout user
         */
        logout: async () => {
          try {
            // Call logout endpoint to blacklist tokens
            await apiClient.post('/auth/logout/', {
              refresh: tokenManager.getRefreshToken(),
            });
          } catch (error) {
            // Continue with logout even if API call fails
            console.error('Logout API error:', error);
          }

          // Clear tokens and state
          tokenManager.clearTokens();
          set(initialState);

          // Dispatch event for other components to react
          window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'user_initiated' } }));
        },

        /**
         * Fetch current user profile
         */
        fetchUser: async () => {
          if (!tokenManager.isAuthenticated()) {
            return null;
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
            set({
              isLoading: false,
              error: error.message || 'Update failed',
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
            set({
              isLoading: false,
              error: error.message || 'Password change failed',
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
            set({
              isLoading: false,
              error: error.message || 'Password reset request failed',
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
            set({
              isLoading: false,
              error: error.message || 'Password reset failed',
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
            set({
              isLoading: false,
              error: error.message || 'Email verification failed',
            });
            throw error;
          }
        },

        /**
         * Clear any errors
         */
        clearError: () => set({ error: null }),

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
        // Only persist user and isAuthenticated
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
