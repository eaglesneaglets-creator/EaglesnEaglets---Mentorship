import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './index';

/**
 * Phase 26-01b — a 403 + error_code 'account_suspended' must tear the session
 * down and route to /suspended, instead of being treated as an expired session
 * (401) which would trigger a pointless refresh loop.
 */

const suspendedBody = {
  success: false,
  error: {
    code: 403,
    type: 'AccountSuspended',
    error_code: 'account_suspended',
    message: 'Your account has been suspended.',
  },
};

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => 'application/json' },
  json: async () => body,
});

describe('apiClient account-suspension handling', () => {
  let replaceSpy;
  let events;
  let fetchSpy;

  beforeEach(() => {
    events = [];
    apiClient._suspensionTeardownStarted = false;
    vi.spyOn(window, 'dispatchEvent').mockImplementation((e) => {
      events.push(e);
      return true;
    });
    fetchSpy = vi.fn(() => Promise.resolve({ ok: true }));
    globalThis.fetch = fetchSpy;
    // window.location.replace is not implementable in jsdom — stub the whole object.
    replaceSpy = vi.fn();
    delete window.location;
    window.location = { pathname: '/eaglet/dashboard', replace: replaceSpy };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    apiClient._suspensionTeardownStarted = false;
  });

  /** teardown is async (awaits the logout call) — let microtasks flush. */
  const flush = () => new Promise((r) => setTimeout(r, 0));

  it('dispatches auth:logout and redirects to /suspended on a suspended 403', async () => {
    await expect(
      apiClient.handleResponse(jsonResponse(403, suspendedBody)),
    ).rejects.toMatchObject({ status: 403 });
    await flush();

    const logout = events.find((e) => e.type === 'auth:logout');
    expect(logout).toBeTruthy();
    expect(logout.detail.reason).toBe('account_suspended');
    expect(replaceSpy).toHaveBeenCalledWith('/suspended');
  });

  it('calls the logout endpoint so the SERVER deletes the httpOnly cookies', async () => {
    // JS cannot delete httpOnly cookies — without this call the browser keeps
    // sending valid suspended-user cookies, which also hijacks a different
    // person signing in on the same browser.
    await expect(
      apiClient.handleResponse(jsonResponse(403, suspendedBody)),
    ).rejects.toMatchObject({ status: 403 });
    await flush();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain('/auth/logout/');
    expect(opts.method).toBe('POST');
    expect(opts.credentials).toBe('include');
  });

  it('still redirects when the logout call fails (never strands the user)', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error('offline')));

    await expect(
      apiClient.handleResponse(jsonResponse(403, suspendedBody)),
    ).rejects.toMatchObject({ status: 403 });
    await flush();

    expect(replaceSpy).toHaveBeenCalledWith('/suspended');
  });

  it('does not redirect on an ordinary 403 (permission denied)', async () => {
    const plain403 = {
      success: false,
      error: { code: 403, type: 'ForbiddenException', message: 'Not allowed.' },
    };

    await expect(
      apiClient.handleResponse(jsonResponse(403, plain403)),
    ).rejects.toMatchObject({ status: 403 });
    await flush();

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not redirect again when already on /suspended', async () => {
    window.location.pathname = '/suspended';

    await expect(
      apiClient.handleResponse(jsonResponse(403, suspendedBody)),
    ).rejects.toMatchObject({ status: 403 });
    await flush();

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
