/**
 * Authentication Store
 * Manages user authentication state with Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { tokenManager } from '@api';
import { authService } from '@/modules/auth/services/auth-service';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  // Access token kept in memory only (not localStorage) — used for WebSocket ?token= param.
  // httpOnly cookie is the primary auth mechanism for HTTP requests.
  accessToken: null,
  // Program access status from /auth/me/ (plan 14-02 BE / 14-05 FE).
  // Drives sidebar lock badges, route gating, and dashboard widgets.
  accessStatus: null,
  // Role context for stacked-admin users (plan 18-03).
  // Values: 'mentor' | 'admin' | null. Computed on /auth/me/ hydration —
  // see hydrateCurrentMode(). Single-role users have it forced to their role.
  currentMode: null,
};

// Persisted under its own key so the value is glanceable in DevTools and
// cleared independently of the auth-storage blob.
const MODE_STORAGE_KEY = 'ee_role_mode';

const readStoredMode = () => {
  try {
    const m = localStorage.getItem(MODE_STORAGE_KEY);
    // Tri-mode contract (plan 22-02): 'admin' | 'mentor' | 'mentee'.
    return m === 'admin' || m === 'mentor' || m === 'mentee' ? m : null;
  } catch {
    return null;
  }
};

const writeStoredMode = (mode) => {
  try {
    if (mode) localStorage.setItem(MODE_STORAGE_KEY, mode);
    else localStorage.removeItem(MODE_STORAGE_KEY);
  } catch {
    /* private browsing */
  }
};

/**
 * Pick the right mode for a user given:
 *  - whether they're stacked (eagle OR eaglet, plus is_platform_staff — plan 22)
 *  - whether the BE flagged a first-admin-session moment
 *  - persisted localStorage value
 *
 * Tri-mode contract (plan 22-02): 'admin' | 'mentor' | 'mentee'.
 *  - Stacked mentor (eagle + is_platform_staff): toggles 'mentor' <-> 'admin'
 *  - Stacked mentee (eaglet + is_platform_staff): toggles 'mentee' <-> 'admin'
 *  - Pure admin: forced to 'admin'
 *  - Pure mentor / pure mentee: forced to their non-admin mode; switcher hidden
 */
export const resolveCurrentMode = (user) => {
  if (!user) return null;
  const isStackedAdmin =
    (user.role === 'eagle' || user.role === 'eaglet') &&
    user.is_platform_staff === true;
  const isPureAdmin = (user.role === 'admin' || user.is_superuser) && !isStackedAdmin;
  if (isPureAdmin) return 'admin';
  const nonAdminMode = user.role === 'eaglet' ? 'mentee' : 'mentor';
  if (!isStackedAdmin) return nonAdminMode; // pure mentor or pure mentee
  // Stacked path:
  if (user.admin_request?.first_admin_session) return 'admin';
  const stored = readStoredMode();
  // Only honour stored value if it's compatible with the user's role pair.
  const validForRole = stored === 'admin' || stored === nonAdminMode;
  return validForRole ? stored : nonAdminMode;
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
            const response = await authService.login(email, password);

            // Capture both tokens. Refresh goes to localStorage (temporary
            // cross-origin fallback) AND is also set as an httpOnly cookie
            // by the BE — see api/index.js tokenManager note.
            const data = response.data || response;
            const user = data.user || data;
            const accessToken = data.access || null;
            const refreshToken = data.refresh || null;

            if (accessToken) {
              tokenManager.setTokens(accessToken, refreshToken);
            }

            // Resolve role-switcher mode at login time. Stacked admins
            // land in mentor mode unless the BE flags first_admin_session.
            const currentMode = resolveCurrentMode(user);
            if (currentMode) writeStoredMode(currentMode);

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              accessToken,
              currentMode,
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
            const response = await authService.register(userData, {
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
            // Backend reads the refresh token from the httpOnly cookie and
            // blacklists it, then deletes both cookies in the response.
            await authService.logout();
          } catch {
            // Continue with logout even if API call fails
          }

          tokenManager.clearTokens();
          writeStoredMode(null);
          set(initialState);

          // Dispatch event for other components to react
          window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'user_initiated' } }));
        },

        /**
         * Fetch current user profile
         */
        fetchUser: async ({ force = false } = {}) => {
          // With httpOnly cookies, we can't check localStorage for a token.
          // The cookie is sent automatically — just attempt the request.
          // Skip if we already have a user AND access_status loaded; otherwise
          // refetch so /auth/me/ delivers the program access_status payload.
          if (!force && get().user && get().accessStatus !== null) {
            return get().user;
          }

          set({ isLoading: true });

          try {
            const response = await authService.getCurrentUser();
            const user = response.data || response;
            const accessStatus = user?.access_status ?? null;

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              accessStatus,
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
            const response = await authService.updateProfile(data);
            const user = response.data || response;
            const accessStatus = user?.access_status ?? get().accessStatus;

            set({
              user,
              isLoading: false,
              accessStatus,
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
            await authService.changePassword(oldPassword, newPassword, newPasswordConfirm);

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
            await authService.requestPasswordReset(email);
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
            await authService.confirmPasswordReset(token, newPassword, newPasswordConfirm);
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
            await authService.verifyEmail(token);
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
            await authService.resendVerification(email);
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
         * Set program access_status directly. Use after enrollment lifecycle
         * mutations (apply / approve / opt-out) to keep gating in sync without
         * a full /auth/me/ refetch.
         */
        setAccessStatus: (accessStatus) => set({ accessStatus }),

        /**
         * Force-refetch /auth/me/ to refresh access_status.
         *
         * Dedupe + throttle: this is wired to window-focus in two places
         * (DashboardLayout + EagletNestPage). Without guards a single focus
         * event can fire two /auth/me/ calls back-to-back, and rapid alt-tab
         * sequences in production blew through the 1000/hr user throttle.
         *
         * - In-flight dedupe: concurrent callers reuse the same promise.
         * - 5-second min interval: ignore repeat calls in tight windows.
         */
        refreshAccessStatus: async () => {
          const now = Date.now();
          const state = get();
          if (state._authMeInflight) return state._authMeInflight;
          if (state._authMeLastAt && now - state._authMeLastAt < 5000) {
            return state.accessStatus;
          }
          const promise = (async () => {
            try {
              const response = await authService.getCurrentUser();
              const user = response.data || response;
              // Recompute current mode whenever /auth/me/ lands. The BE may
              // have flipped `admin_request.first_admin_session` to true to
              // force admin mode on the next render — see plan 18-03.
              const nextMode = resolveCurrentMode(user);
              if (nextMode) writeStoredMode(nextMode);
              set({
                user,
                accessStatus: user?.access_status ?? null,
                currentMode: nextMode,
              });
              return user?.access_status ?? null;
            } catch {
              return get().accessStatus;
            } finally {
              set({ _authMeInflight: null, _authMeLastAt: Date.now() });
            }
          })();
          set({ _authMeInflight: promise });
          return promise;
        },

        /**
         * Switch the role context for stacked-admin users (plan 18-03).
         * Persists to localStorage so refresh + cross-tab stays in sync.
         */
        setCurrentMode: (mode) => {
          if (mode !== 'admin' && mode !== 'mentor' && mode !== 'mentee') return;
          writeStoredMode(mode);
          set({ currentMode: mode });
        },

        /**
         * Clear any errors
         */
        clearError: () => set({ error: null }),

        /**
         * Set auth state directly (used for OAuth callbacks)
         */
        setAuth: ({ accessToken, refreshToken, user }) => {
          // Capture both tokens — refresh goes to localStorage (cross-origin
          // fallback) and is also set as an httpOnly cookie by the BE.
          if (accessToken) {
            tokenManager.setTokens(accessToken, refreshToken || null);
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

// ---------------------------------------------------------------------------
// Selector hooks (plan 14-05)
// Each selector subscribes to a single slice so consumers don't re-render on
// unrelated store changes.
// ---------------------------------------------------------------------------

export const useHasActiveProgram = () =>
  useAuthStore((s) => Boolean(s.accessStatus?.has_active_program));

export const useActiveProgram = () =>
  useAuthStore((s) => s.accessStatus?.active_program ?? null);

export const usePendingProgramRequest = () =>
  useAuthStore((s) => s.accessStatus?.pending_program_request ?? null);

export const useMenteeLevel = () =>
  useAuthStore((s) => s.accessStatus?.mentee_level ?? null);

const EMPTY_ARRAY = [];

export const useLockedFeatures = () =>
  useAuthStore((s) => s.accessStatus?.locked_features ?? EMPTY_ARRAY);

export const useMentorEligibility = () =>
  useAuthStore((s) => Boolean(s.accessStatus?.mentor_eligibility));

// ─── Mentor Application passthroughs (plan 16-02) ──────────────────────────
// /auth/me/ exposes mentor_application_status + mentor_application_eligible
// on the user payload (eaglet branch). These selectors avoid a parallel store
// slice — the canonical source stays the /auth/me/ payload.

export const useMentorApplicationStatus = () =>
  useAuthStore((s) => s.user?.mentor_application_status ?? null);

export const useMentorApplicationEligible = () =>
  useAuthStore((s) => Boolean(s.user?.mentor_application_eligible));

// ─── Role-switcher selectors (plan 18-03) ──────────────────────────────────

export const useCurrentMode = () =>
  useAuthStore((s) => s.currentMode);

export const useSetCurrentMode = () =>
  useAuthStore((s) => s.setCurrentMode);

/** True iff the user is a mentor OR mentee who also holds platform-admin
 *  privileges (plan 22-02 extended this from eagle-only). */
export const useIsStackedAdmin = () =>
  useAuthStore((s) =>
    Boolean(
      (s.user?.role === 'eagle' || s.user?.role === 'eaglet') &&
        s.user?.is_platform_staff === true,
    ),
  );

// Listen for logout events from other parts of the app
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', (event) => {
    const store = useAuthStore.getState();
    if (event.detail?.reason === 'session_expired' && store.isAuthenticated) {
      tokenManager.clearTokens();
      writeStoredMode(null);
      useAuthStore.setState(initialState);
    }
  });
}
