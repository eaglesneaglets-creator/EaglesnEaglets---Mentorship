import { Link } from 'react-router-dom';
import StoreHeader from '../../modules/store/components/StoreHeader';
import { useOrders } from '../../modules/store/hooks/useOrders';
import { useAuthStore } from '@store';

const STATUS_BADGE = {
    pending:         { label: 'Pending',          cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
    payment_pending: { label: 'Awaiting Payment',  cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
    paid:            { label: 'Paid',              cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
    processing:      { label: 'Processing',        cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
    shipped:         { label: 'Shipped',           cls: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
    delivered:       { label: 'Delivered',         cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
    cancelled:       { label: 'Cancelled',         cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
    refunded:        { label: 'Refunded',          cls: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_BADGE[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

/* Skeleton card for loading state */
const SkeletonCard = ({ delay = 0 }) => (
    <div
        className="animate-pulse bg-white rounded-2xl border border-slate-200 p-5"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-2/5" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
        </div>
    </div>
);

/* Fade-in + slide-up animation applied per card via inline delay */
const OrderCard = ({ order, index }) => {
    const isPendingPayment = order.status === 'pending' || order.status === 'payment_pending';
    const itemCount = order.item_count ?? order.items?.length ?? '—';

    return (
        <Link
            to={`/store/orders/${order.id}`}
            className="block bg-white rounded-2xl border border-slate-200 p-5
                       hover:border-primary/40 hover:shadow-md transition-all duration-200 group
                       animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
        >
            <div className="flex items-center justify-between gap-4">
                {/* Left: icon + info */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200
                        ${isPendingPayment ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-primary/10 group-hover:bg-primary/20'}`}>
                        <span className={`material-symbols-outlined text-base
                            ${isPendingPayment ? 'text-blue-500' : 'text-primary'}`}>
                            {isPendingPayment ? 'payment' : 'receipt'}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">
                            Order #{String(order.id).substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}&nbsp;&middot;&nbsp;
                            ₵{Number(order.total_amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* Right: badge + action hint */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={order.status} />
                    <span className={`text-xs font-medium flex items-center gap-0.5 transition-colors duration-150
                        ${isPendingPayment
                            ? 'text-blue-500 group-hover:text-blue-700'
                            : 'text-slate-400 group-hover:text-primary'}`}>
                        {isPendingPayment ? 'Complete payment' : 'View details'}
                        <span className="material-symbols-outlined text-sm transition-transform duration-150 group-hover:translate-x-0.5">
                            arrow_forward
                        </span>
                    </span>
                </div>
            </div>
        </Link>
    );
};

const OrdersPage = () => {
    const { isAuthenticated } = useAuthStore();
    const { data, isLoading, isError } = useOrders({ enabled: isAuthenticated });
    const orders = data?.data ?? data ?? [];

    return (
        <div className="min-h-screen bg-slate-50">
            <StoreHeader />

            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* Page header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in-up"
                     style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Track and manage your purchases</p>
                    </div>
                    <Link
                        to="/store"
                        className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">storefront</span>
                        <span className="hidden sm:inline">Browse Store</span>
                    </Link>
                </div>

                {/* ── Guest state ── */}
                {!isAuthenticated && (
                    <div className="animate-fade-in-up text-center py-20"
                         style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-primary">lock</span>
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Sign in to view your orders</h2>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            Your order history is saved to your account. Sign in to track all your purchases.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-95 transition-all text-sm"
                            >
                                <span className="material-symbols-outlined text-base">login</span>
                                Sign In
                            </Link>
                            <Link
                                to="/store"
                                className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-sm"
                            >
                                <span className="material-symbols-outlined text-base">storefront</span>
                                Continue as Guest
                            </Link>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">
                            Have a guest order?&nbsp;
                            <span className="text-primary">Check your confirmation email for the order link.</span>
                        </p>
                    </div>
                )}

                {/* ── Loading skeletons ── */}
                {isAuthenticated && isLoading && (
                    <div className="space-y-3">
                        {[0, 80, 160].map((delay) => (
                            <SkeletonCard key={delay} delay={delay} />
                        ))}
                    </div>
                )}

                {/* ── Error state ── */}
                {isAuthenticated && isError && (
                    <div className="animate-fade-in-up text-center py-16"
                         style={{ animationFillMode: 'both' }}>
                        <span className="material-symbols-outlined text-4xl text-slate-300">error_outline</span>
                        <p className="text-slate-500 mt-2 text-sm">Failed to load orders. Please refresh and try again.</p>
                    </div>
                )}

                {/* ── Empty state ── */}
                {isAuthenticated && !isLoading && !isError && orders.length === 0 && (
                    <div className="animate-fade-in-up text-center py-20"
                         style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-400">receipt_long</span>
                        </div>
                        <h2 className="text-lg font-semibold text-slate-700">No orders yet</h2>
                        <p className="text-slate-500 text-sm mt-1">When you place an order, it will appear here.</p>
                        <Link
                            to="/store"
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-95 transition-all text-sm"
                        >
                            <span className="material-symbols-outlined text-base">storefront</span>
                            Start Shopping
                        </Link>
                    </div>
                )}

                {/* ── Orders list ── */}
                {isAuthenticated && !isLoading && !isError && orders.length > 0 && (
                    <div className="space-y-3">
                        {orders.map((order, i) => (
                            <OrderCard key={order.id} order={order} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
