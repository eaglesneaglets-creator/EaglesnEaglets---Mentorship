import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @api before importing the store
vi.mock('@api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
  tokenManager: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getRefreshToken: vi.fn(() => null),
  },
}));

// Import store after mock is set up
const { useAuthStore } = await import('./auth-store');

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
};

describe('useAuthStore — synchronous actions', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState(initialState);
  });

  it('starts with the correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('clearError sets error to null', () => {
    useAuthStore.setState({ error: 'Something went wrong' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('setAccessToken updates accessToken in state', () => {
    useAuthStore.getState().setAccessToken('my-access-token');
    expect(useAuthStore.getState().accessToken).toBe('my-access-token');
  });

  it('hasRole returns true when user has the given role', () => {
    useAuthStore.setState({ user: { role: 'eagle' } });
    expect(useAuthStore.getState().hasRole('eagle')).toBe(true);
    expect(useAuthStore.getState().hasRole('eaglet')).toBe(false);
  });

  it('hasRole returns false when user is null', () => {
    useAuthStore.setState({ user: null });
    expect(useAuthStore.getState().hasRole('eagle')).toBe(false);
  });

  it('isEagle returns true for eagle role', () => {
    useAuthStore.setState({ user: { role: 'eagle' } });
    expect(useAuthStore.getState().isEagle()).toBe(true);
  });

  it('isEaglet returns true for eaglet role', () => {
    useAuthStore.setState({ user: { role: 'eaglet' } });
    expect(useAuthStore.getState().isEaglet()).toBe(true);
  });

  it('isAdmin returns true for admin role', () => {
    useAuthStore.setState({ user: { role: 'admin' } });
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('isAdmin returns true when user is_staff', () => {
    useAuthStore.setState({ user: { role: 'eagle', is_staff: true } });
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('isAdmin returns false for regular user', () => {
    useAuthStore.setState({ user: { role: 'eaglet', is_staff: false } });
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('setAuth updates user, isAuthenticated and accessToken', async () => {
    const { tokenManager } = await import('@api');
    const user = { id: '1', name: 'Test User', role: 'eagle' };
    // Use mock tokens that clearly indicate they're test values
    const mockAccessToken = 'mock_access_token_for_testing_only';
    const mockRefreshToken = 'mock_refresh_token_for_testing_only';

    useAuthStore.getState().setAuth({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user,
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe(mockAccessToken);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(tokenManager.setTokens).toHaveBeenCalledWith(mockAccessToken, mockRefreshToken);
  });
});
