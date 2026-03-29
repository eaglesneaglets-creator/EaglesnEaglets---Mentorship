import PropTypes from 'prop-types';
import { usePayment } from '../hooks/usePayment';

/**
 * PaystackCheckout — renders a "Pay Now" button that opens the Paystack inline popup.
 *
 * Used in OrderConfirmationPage when order.status is 'pending' or 'payment_pending'.
 * No npm Paystack package needed — relies on window.PaystackPop from CDN (index.html).
 */
const PaystackCheckout = ({ order }) => {
    const { startPayment, isInitializing, error } = usePayment(order);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">payment</span>
                <div>
                    <p className="font-semibold text-slate-800 text-sm">Complete Your Payment</p>
                    <p className="text-slate-500 text-xs mt-0.5">Secure payment powered by Paystack</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            <button
                onClick={startPayment}
                disabled={isInitializing}
                className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
                {isInitializing ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Preparing payment...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-base">lock</span>
                        Pay Now &mdash; &#8373;{Number(order.total_amount).toLocaleString()}
                    </>
                )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-2">
                🔒 Secured by Paystack &middot; No card details stored on our servers
            </p>
        </div>
    );
};

PaystackCheckout.propTypes = {
    order: PropTypes.shape({
        id: PropTypes.string.isRequired,
        total_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        guest_email: PropTypes.string,
        user_email: PropTypes.string,
    }).isRequired,
};

export default PaystackCheckout;
