import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

/**
 * usePayment — Paystack readiness (P3, 2026-07-31).
 *
 * The CDN script in index.html gained `defer` so it stops blocking HTML parsing
 * on every page. That makes `window.PaystackPop` arrive slightly later, so the
 * hook must WAIT for it rather than failing the first click and telling the user
 * to refresh — which previously threw away a payment over a few hundred ms.
 *
 * These tests pin both directions: it must wait when the script is in flight,
 * and it must still give up (with a usable message) if the CDN never responds.
 */

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const mockInitializePayment = vi.fn();
vi.mock('../services/store-service', () => ({
  default: { initializePayment: (...a) => mockInitializePayment(...a) },
}));

const { usePayment } = await import('./usePayment');

const ORDER = { id: 'o1', customer_email: 'buyer@test.com', total_amount: '25.00' };

/** Minimal stand-in for the Paystack global. */
const fakePaystack = () => {
  const openIframe = vi.fn();
  return {
    openIframe,
    global: { setup: vi.fn(() => ({ openIframe })) },
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  delete window.PaystackPop;
  mockInitializePayment.mockResolvedValue({ data: { reference: 'ref_123' } });
});

afterEach(() => {
  delete window.PaystackPop;
  vi.useRealTimers();
});

describe('usePayment — Paystack readiness', () => {
  it('opens the popup immediately when the script is already loaded', async () => {
    const fake = fakePaystack();
    window.PaystackPop = fake.global;

    const { result } = renderHook(() => usePayment(ORDER));
    await act(async () => { await result.current.startPayment(); });

    expect(fake.global.setup).toHaveBeenCalledTimes(1);
    expect(fake.openIframe).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('waits for a still-loading script instead of failing the click', async () => {
    // The regression this guards: with `defer`, a fast click can land before the
    // CDN script has executed. The old code errored out on the spot.
    const fake = fakePaystack();
    const { result } = renderHook(() => usePayment(ORDER));

    let payment;
    act(() => { payment = result.current.startPayment(); });

    // Script arrives ~250ms after the click.
    await new Promise((r) => setTimeout(r, 250));
    window.PaystackPop = fake.global;

    await act(async () => { await payment; });

    expect(fake.global.setup).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a usable error if the script never loads', async () => {
    const { result } = renderHook(() => usePayment(ORDER));

    // Short timeout so the test doesn't sit for the full 8s production budget.
    await act(async () => { await result.current.startPayment(); });

    await waitFor(() => expect(result.current.error).toBeTruthy(), { timeout: 10000 });
    expect(result.current.error).toMatch(/could not be loaded/i);
    // Must not tell the user to refresh — the old message did, and it lost sales.
    expect(result.current.error).not.toMatch(/refresh/i);
    expect(result.current.isInitializing).toBe(false);
    expect(mockInitializePayment).not.toHaveBeenCalled();
  }, 15000);

  it('does not charge before the backend returns a reference', async () => {
    const fake = fakePaystack();
    window.PaystackPop = fake.global;

    const { result } = renderHook(() => usePayment(ORDER));
    await act(async () => { await result.current.startPayment(); });

    expect(mockInitializePayment).toHaveBeenCalledWith('o1');
    expect(fake.global.setup).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'ref_123', amount: 2500, currency: 'GHS' }),
    );
  });
});
