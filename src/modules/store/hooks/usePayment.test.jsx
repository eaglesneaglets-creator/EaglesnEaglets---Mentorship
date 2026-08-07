import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

/**
 * usePayment — on-demand Paystack loading.
 *
 * The CDN script is injected only when checkout begins, keeping Paystack's
 * iframe and analytics requests off routes that never accept a payment.
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
  document.querySelector('script[data-paystack-inline]')?.remove();
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

  it('loads the Paystack script on demand before opening the popup', async () => {
    const fake = fakePaystack();
    const { result } = renderHook(() => usePayment(ORDER));

    let payment;
    act(() => { payment = result.current.startPayment(); });

    const script = document.querySelector('script[data-paystack-inline]');
    expect(script).not.toBeNull();
    expect(script.src).toBe('https://js.paystack.co/v1/inline.js');

    window.PaystackPop = fake.global;
    script.dispatchEvent(new Event('load'));

    await act(async () => { await payment; });

    expect(fake.global.setup).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a usable error if the script fails to load', async () => {
    const { result } = renderHook(() => usePayment(ORDER));

    let payment;
    act(() => { payment = result.current.startPayment(); });
    document.querySelector('script[data-paystack-inline]').dispatchEvent(new Event('error'));
    await act(async () => { await payment; });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error).toMatch(/could not be loaded/i);
    // Must not tell the user to refresh — the old message did, and it lost sales.
    expect(result.current.error).not.toMatch(/refresh/i);
    expect(result.current.isInitializing).toBe(false);
    expect(mockInitializePayment).not.toHaveBeenCalled();
  });

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
