import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * The auth store's `accessToken` must track the CURRENT token.
 *
 * Root cause of the reported "WS reconnect fails until refresh" bug: a silent
 * token refresh updated the in-memory token used by HTTP calls, but the store's
 * copy was written exactly once (DashboardLayout, on mount, `[]` deps).
 *
 * HTTP was unaffected — it reads the token at call time. WebSockets bake it into
 * the connection URL, so after the 15-minute access-token lifetime every
 * reconnect presented a dead token and was rejected 4001.
 */

vi.mock('@/modules/auth/services/auth-service', () => ({
  authService: { getCurrentUser: vi.fn(), logout: vi.fn() },
}));

const { tokenManager } = await import('@api');
const { useAuthStore } = await import('./auth-store');

beforeEach(() => {
  useAuthStore.setState({ accessToken: null });
});

describe('auth store ↔ tokenManager sync', () => {
  it('mirrors a refreshed token into the store', () => {
    // This is what a silent refresh does internally.
    tokenManager.setTokens('refreshed-token-xyz', null);
    expect(useAuthStore.getState().accessToken).toBe('refreshed-token-xyz');
  });

  it('keeps the store current across successive refreshes', () => {
    tokenManager.setTokens('token-1', null);
    tokenManager.setTokens('token-2', null);
    expect(useAuthStore.getState().accessToken).toBe('token-2');
  });

  it('clears the store token on logout', () => {
    tokenManager.setTokens('token-1', null);
    tokenManager.clearTokens();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('does not write when the token is unchanged (avoids needless re-renders)', () => {
    tokenManager.setTokens('same-token', null);
    const spy = vi.spyOn(useAuthStore, 'setState');
    tokenManager.setTokens('same-token', null);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
