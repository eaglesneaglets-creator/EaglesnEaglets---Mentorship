import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

/**
 * useWebSocket — reconnect behaviour (user-reported 2026-07-31).
 *
 * Reported: "ws disconnects while the user is still active and reconnecting
 * fails unless the page is refreshed."
 *
 * Root cause was two bugs compounding:
 *   1. `refreshAccessToken()` updated the in-memory token but never the auth
 *      store, whose copy was written once on mount. WS URLs embed `?token=`, so
 *      after the 15-minute access-token lifetime every reconnect used a dead
 *      token.
 *   2. `onclose` treated 4001 as terminal, so that first rejection stopped all
 *      further retries for the life of the page. Only a reload recovered.
 *
 * These tests pin the second half (the hook). The first half is pinned in
 * api/tokenManager.test.js.
 */

const mockRefresh = vi.fn();
vi.mock('@api', () => ({
  refreshAccessToken: (...a) => mockRefresh(...a),
}));

const { useWebSocket } = await import('./useWebSocket');

/** Minimal WebSocket double we can drive from the test. */
class FakeWS {
  static instances = [];
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    FakeWS.instances.push(this);
  }
  close() { this.readyState = 3; }
  // Test helpers
  open() { this.readyState = 1; this.onopen?.(); }
  fail(code) { this.readyState = 3; this.onclose?.({ code }); }
}

beforeEach(() => {
  vi.clearAllMocks();
  FakeWS.instances = [];
  vi.stubGlobal('WebSocket', FakeWS);
  mockRefresh.mockResolvedValue('new-token-abc');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const opts = { path: 'ws/notifications/', token: 'stale-token' };

describe('useWebSocket auth recovery', () => {
  it('puts the token in the connection URL', () => {
    renderHook(() => useWebSocket(opts));
    expect(FakeWS.instances[0].url).toContain('?token=stale-token');
  });

  it('attempts a silent token refresh when the server rejects with 4001', async () => {
    // THE REGRESSION: this used to give up permanently.
    renderHook(() => useWebSocket(opts));
    await act(async () => { FakeWS.instances[0].fail(4001); });

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));
  });

  it('only refreshes once per connection generation', async () => {
    // A token the server keeps rejecting must not loop refresh <-> connect.
    const { result } = renderHook(() => useWebSocket(opts));
    await act(async () => { FakeWS.instances[0].fail(4001); });
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));

    // A second 4001 on the same generation must NOT trigger another refresh.
    await act(async () => { FakeWS.instances[0].fail(4001); });
    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('closed');
  });

  it('re-arms the refresh after a successful connection', async () => {
    renderHook(() => useWebSocket(opts));
    await act(async () => { FakeWS.instances[0].fail(4001); });
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));

    // Connection recovers, then the new token later expires too.
    await act(async () => { FakeWS.instances[0].open(); });
    await act(async () => { FakeWS.instances[0].fail(4001); });

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(2));
  });

  it('does NOT retry on 4003 (not a participant) — that is permanent', async () => {
    renderHook(() => useWebSocket(opts));
    await act(async () => { FakeWS.instances[0].fail(4003); });

    expect(mockRefresh).not.toHaveBeenCalled();
    expect(FakeWS.instances).toHaveLength(1);
  });

  it('does NOT retry on 4004 (no active program) — also permanent', async () => {
    renderHook(() => useWebSocket(opts));
    await act(async () => { FakeWS.instances[0].fail(4004); });

    expect(mockRefresh).not.toHaveBeenCalled();
    expect(FakeWS.instances).toHaveLength(1);
  });

  it('gives up quietly if the refresh itself fails (session really is gone)', async () => {
    mockRefresh.mockRejectedValue(new Error('session_expired'));
    const { result } = renderHook(() => useWebSocket(opts));
    await act(async () => { FakeWS.instances[0].fail(4001); });

    await waitFor(() => expect(result.current.status).toBe('closed'));
  });
});
