import { useParams, Link } from 'react-router-dom';
import { useOrderDetail } from '../../modules/store/hooks/useOrders';

const STATUS_META = {
    pending: { icon: 'hourglass_empty', color: 'text-amber-500', label: 'Pending Payment' },
    payment_pending: { icon: 'payment', color: 'text-blue-500', label: 'Payment Pending' },
    paid: { icon: 'check_circle', color: 'text-emerald-500', label: 'Payment Confirmed' },
    processing: { icon: 'inventory', color: 'text-blue-500', label: 'Processing' },
    shipped: { icon: 'local_shipping', color: 'text-indigo-500', label: 'Shipped' },
    delivered: { icon: 'done_all', color: 'text-emerald-600', label: 'Delivered' },
    cancelled: { icon: 'cancel', color: 'text-red-500', label: 'Cancelled' },
    refunded: { icon: 'undo', color: 'text-slate-500', label: 'Refunded' },
};

const OrderConfirmationPage = () => {
    const { id } = useParams();
    const { data, isLoading } = useOrderDetail(id);
    const order = data?.data;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <p className="text-slate-400">Order not found. <Link to="/store" className="text-primary">Back to store</Link></p>
        </div>
    );

    const meta = STATUS_META[order.status] ?? STATUS_META.pending;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 text-center">
                    <span className={`material-symbols-outlined text-5xl ${meta.color}`}>{meta.icon}</span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-3">Order {meta.label}</h1>
                    <p className="text-slate-500 text-sm mt-1">Order #{String(order.id).substring(0, 8).toUpperCase()}</p>

                    {/* Payment CTA placeholder — MM-20 wires Paystack here */}
                    {(order.status === 'pending' || order.status === 'payment_pending') && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-sm text-amber-700 font-medium">Payment required to confirm your order.</p>
                            <p className="text-xs text-amber-600 mt-1">Payment integration coming soon (MM-20).</p>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="mt-8 text-left space-y-3">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-slate-700">{item.product_name} × {item.quantity}</span>
                                <span className="font-semibold text-slate-900">₦{Number(item.subtotal).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-primary">₦{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <Link to="/store" className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm text-center">
                            Continue Shopping
                        </Link>
                        <Link to="/dashboard" className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm text-center">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
