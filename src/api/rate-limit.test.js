import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, tokenManager } from './index';

const rateLimitedResponse = (retryAfter = null) => ({
  ok: false,
  status: 429,
  headers: {
    get: (name) => {
      if (name.toLowerCase() === 'content-type') return 'application/json';
      if (name.toLowerCase() === 'retry-after') return retryAfter;
      return null;
    },
  },
  json: async () => ({ detail: 'Request was throttled.' }),
});

describe('apiClient rate-limit handling', () => {
  afterEach(() => {
    tokenManager.clearTokens();
    vi.restoreAllMocks();
  });

  it('provides actionable singular Retry-After guidance', async () => {
    await expect(apiClient.handleResponse(rateLimitedResponse('1'))).rejects.toMatchObject({
      status: 429,
      message: "You're going a bit fast for us. Try again in 1 second.",
    });
  });

  it('uses a safe fallback when Retry-After is unavailable', async () => {
    await expect(apiClient.handleResponse(rateLimitedResponse())).rejects.toMatchObject({
      status: 429,
      message: "You're going a bit fast for us. Please try again shortly.",
    });
  });

  it('does not retry a 429 response in the lower-level request client', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ csrf_token: 'test-csrf-token' }),
      })
      .mockResolvedValue(rateLimitedResponse('10'));
    globalThis.fetch = fetchSpy;

    await expect(
      apiClient.request('/throttled/', {
        method: 'POST', retries: 3, retryDelay: 0, skipAuth: true,
      }),
    ).rejects.toMatchObject({ status: 429 });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[1][1].headers['X-CSRFToken']).toBe('test-csrf-token');
  });
});
