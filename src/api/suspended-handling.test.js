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

  beforeEach(() => {
    events = [];
    vi.spyOn(window, 'dispatchEvent').mockImplementation((e) => {
      events.push(e);
      return true;
    });
    // window.location.replace is not implementable in jsdom — stub the whole object.
    replaceSpy = vi.fn();
    delete window.location;
    window.location = { pathname: '/eaglet/dashboard', replace: replaceSpy };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches auth:logout and redirects to /suspended on a suspended 403', async () => {
    await expect(
      apiClient.handleResponse(jsonResponse(403, suspendedBody)),
    ).rejects.toMatchObject({ status: 403 });

    const logout = events.find((e) => e.type === 'auth:logout');
    expect(logout).toBeTruthy();
    expect(logout.detail.reason).toBe('account_suspended');
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

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('does not redirect again when already on /suspended', async () => {
    window.location.pathname = '/suspended';

    await expect(
      apiClient.handleResponse(jsonResponse(403, suspendedBody)),
    ).rejects.toMatchObject({ status: 403 });

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
