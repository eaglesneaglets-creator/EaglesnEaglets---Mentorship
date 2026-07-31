import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreService from '../services/store-service';

/**
 * usePayment — manages the Paystack inline popup flow for an order.
 *
 * Flow:
 *   1. Call StoreService.initializePayment(order.id) → get reference from backend
 *   2. Open window.PaystackPop.setup({ key, email, amount, ref, callback })
 *   3. On successful payment, Paystack fires callback → navigate to ?verify=1
 *   4. OrderConfirmationPage polls /verify/ until status === 'paid'
 *
 * Amount is calculated in the minor currency unit (pesewas for GHS).
 * The backend also calculates this independently — the frontend amount is only
 * used to display the correct figure in the Paystack popup.
 */
/**
 * Resolve once window.PaystackPop exists, or reject after `timeoutMs`.
 *
 * The CDN script is `defer`red, so it is normally ready long before anyone can
 * reach a Pay button. This covers the slow-network tail: previously the very
 * first click in that window failed outright and told the user to refresh, which
 * threw away a payment for what is usually a few hundred milliseconds of waiting.
 */
function waitForPaystack(timeoutMs = 8000) {
    if (window.PaystackPop) return Promise.resolve(window.PaystackPop);

    return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const poll = setInterval(() => {
            if (window.PaystackPop) {
                clearInterval(poll);
                resolve(window.PaystackPop);
            } else if (Date.now() - startedAt > timeoutMs) {
                clearInterval(poll);
                reject(new Error(
                    'Payment system could not be loaded. Please check your connection and try again.'
                ));
            }
        }, 100);
    });
}

export function usePayment(order) {
    const navigate = useNavigate();
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState(null);

    const startPayment = async () => {
        setIsInitializing(true);
        setError(null);

        try {
            await waitForPaystack();
        } catch (err) {
            setError(err.message);
            setIsInitializing(false);
            return;
        }

        try {
            const res = await StoreService.initializePayment(order.id);
            // Backend returns { success: true, data: { authorization_url, reference } }
            const { reference } = res?.data ?? res;

            const popup = window.PaystackPop.setup({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: order.customer_email ?? '',
                // Amount in pesewas (GHS minor unit) — must be integer
                amount: Math.round(Number(order.total_amount) * 100),
                ref: reference,
                currency: 'GHS',
                callback: () => {
                    // Paystack fires this after the inline popup payment succeeds.
                    // Navigate to the confirmation page with ?verify=1 to trigger polling.
                    navigate(`/store/orders/${order.id}?verify=1`);
                },
                onClose: () => {
                    // User dismissed the popup without completing payment — no action needed.
                    setIsInitializing(false);
                },
            });

            popup.openIframe();
        } catch (err) {
            setError(err.message || 'Failed to initialise payment. Please try again.');
            setIsInitializing(false);
        }
    };

    return { startPayment, isInitializing, error };
}
