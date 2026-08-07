/**
 * refreshAccessStatus throttle — regression tests (Phase 32-03 follow-up).
 *
 * Reported bug: a user changed their profile picture; Settings showed the new
 * photo but the sidebar kept showing their initials until a hard reload.
 *
 * Cause: `refreshAccessStatus` throttles to one /auth/me/ per 5s. DashboardLayout
 * calls it on mount AND on every window focus — and opening the OS file picker
 * blurs the window, so returning to it fires a refresh moments before the upload
 * finishes. The upload's own refresh then lands inside the throttle window and
 * returns early WITHOUT re-reading the user, so `user.avatar_url` stays stale.
 *
 * The throttle itself is worth keeping (it stops focus-flapping from hammering
 * the endpoint). What it must not do is silently skip a refresh that a mutation
 * explicitly asked for — hence `{ force: true }`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
  tokenManager: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

const mockGetCurrentUser = vi.fn();
vi.mock('../modules/auth/services/auth-service', () => ({
  authService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
  },
}));

const { useAuthStore } = await import('./auth-store');

const userWith = (avatarUrl) => ({
  id: 1,
  first_name: 'James',
  last_name: 'Oppong-Ansah',
  role: 'eagle',
  avatar_url: avatarUrl,
  access_status: { locked_features: [] },
});

describe('refreshAccessStatus throttle', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    useAuthStore.setState({
      user: userWith(null),
      isAuthenticated: true,
      accessStatus: null,
      _authMeInflight: null,
      _authMeLastAt: null,
    });
  });

  it('throttles rapid unforced calls to a single request', async () => {
    mockGetCurrentUser.mockResolvedValue({ data: userWith(null) });

    await useAuthStore.getState().refreshAccessStatus();
    await useAuthStore.getState().refreshAccessStatus();
    await useAuthStore.getState().refreshAccessStatus();

    // The throttle is intentional — focus-flapping must not hammer /auth/me/.
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('force:true refetches inside the throttle window and updates the user', async () => {
    // 1. A window-focus refresh lands first and primes the throttle.
    mockGetCurrentUser.mockResolvedValueOnce({ data: userWith(null) });
    await useAuthStore.getState().refreshAccessStatus();
    expect(useAuthStore.getState().user.avatar_url).toBeNull();

    // 2. The avatar upload succeeds; the server now returns the new picture.
    mockGetCurrentUser.mockResolvedValueOnce({
      data: userWith('https://cdn.example.com/avatar.jpg'),
    });
    await useAuthStore.getState().refreshAccessStatus({ force: true });

    // Without force this second call short-circuits and the sidebar keeps
    // rendering initials — the exact reported bug.
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().user.avatar_url).toBe(
      'https://cdn.example.com/avatar.jpg',
    );
  });

  it('force:true still dedupes against an already in-flight request', async () => {
    // Two mutations resolving together must not fire two identical requests.
    let resolveFn;
    mockGetCurrentUser.mockReturnValueOnce(
      new Promise((res) => { resolveFn = res; }),
    );

    const a = useAuthStore.getState().refreshAccessStatus({ force: true });
    const b = useAuthStore.getState().refreshAccessStatus({ force: true });
    resolveFn({ data: userWith('https://cdn.example.com/a.jpg') });
    await Promise.all([a, b]);

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user.avatar_url).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });
});
