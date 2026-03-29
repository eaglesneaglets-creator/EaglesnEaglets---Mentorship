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
export function usePayment(order) {
    const navigate = useNavigate();
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState(null);

    const startPayment = async () => {
        if (!window.PaystackPop) {
            setError('Payment system not loaded. Please refresh the page and try again.');
            return;
        }

        setIsInitializing(true);
        setError(null);

        try {
            const res = await StoreService.initializePayment(order.id);
            // Backend returns { success: true, data: { authorization_url, reference } }
            const { reference } = res?.data ?? res;

            const popup = window.PaystackPop.setup({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: order.user_email ?? order.guest_email ?? '',
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
