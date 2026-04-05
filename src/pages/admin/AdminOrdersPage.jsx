import { useState } from 'react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAdminOrders, useAdminOrderDetail, useUpdateOrderStatus } from '../../modules/store/hooks/useAdminOrders';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_BADGE = {
    pending:         'bg-amber-100 text-amber-700',
    payment_pending: 'bg-yellow-100 text-yellow-700',
    paid:            'bg-blue-100 text-blue-700',
    processing:      'bg-violet-100 text-violet-700',
    shipped:         'bg-cyan-100 text-cyan-700',
    delivered:       'bg-emerald-100 text-emerald-700',
    cancelled:       'bg-slate-100 text-slate-600',
    refunded:        'bg-orange-100 text-orange-700',
};

const STATUS_LABEL = {
    pending:         'Pending',
    payment_pending: 'Payment Pending',
    paid:            'Paid',
    processing:      'Processing',
    shipped:         'Shipped',
    delivered:       'Delivered',
    cancelled:       'Cancelled',
    refunded:        'Refunded',
};

const STATUS_ICON = {
    pending:         'schedule',
    payment_pending: 'payments',
    paid:            'paid',
    processing:      'inventory_2',
    shipped:         'local_shipping',
    delivered:       'check_circle',
    cancelled:       'cancel',
    refunded:        'currency_exchange',
};

// Mirrors backend ORDER_TRANSITIONS — backend is the source of truth for validation
const ORDER_TRANSITIONS = {
    pending:         ['payment_pending', 'cancelled'],
    payment_pending: ['paid', 'cancelled'],
    paid:            ['processing', 'refunded'],
    processing:      ['shipped', 'cancelled'],
    shipped:         ['delivered'],
    delivered:       ['refunded'],
    cancelled:       [],
    refunded:        [],
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatShort = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[status] || 'bg-slate-100 text-slate-600'}`}>
        {STATUS_LABEL[status] || status}
    </span>
);

// ─── Order Detail Modal ───────────────────────────────────────────────────────

const OrderDetailModal = ({ orderId, onClose }) => {
    const { data: orderResponse, isLoading, error } = useAdminOrderDetail(orderId);
    const updateStatus = useUpdateOrderStatus();
    const [newStatus, setNewStatus] = useState('');
    const [note, setNote] = useState('');
    const [feedback, setFeedback] = useState(null); // { type, message }

    const order = orderResponse?.data ?? orderResponse;

    const allowedTransitions = order ? (ORDER_TRANSITIONS[order.status] || []) : [];

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        try {
            await updateStatus.mutateAsync({ id: orderId, data: { status: newStatus, note } });
            setFeedback({ type: 'success', message: `Order status updated to "${STATUS_LABEL[newStatus]}".` });
            setNewStatus('');
            setNote('');
        } catch (err) {
            const msg = err?.response?.data?.error?.message
                || err?.response?.data?.status?.[0]
                || 'Failed to update status.';
            setFeedback({ type: 'error', message: msg });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                        {order && (
                            <p className="text-sm text-slate-500 mt-0.5">
                                #{order.order_number} · {formatDate(order.created_at)}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {isLoading && (
                    <div className="p-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_empty</span>
                        <p className="mt-2">Loading order details…</p>
                    </div>
                )}

                {error && (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-red-300">cloud_off</span>
                        <p className="text-red-500 font-medium mt-2">Failed to load order</p>
                    </div>
                )}

                {order && (
                    <div className="divide-y divide-slate-100">

                        {/* Section 1: Customer Info */}
                        <div className="px-6 py-5">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer</h3>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-base">person</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900">{order.customer_name}</p>
                                    <p className="text-sm text-slate-500">{order.customer_email}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.is_guest ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {order.is_guest ? 'Guest' : 'Registered'}
                                </span>
                            </div>
                        </div>

                        {/* Section 2: Order Items */}
                        <div className="px-6 py-5">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Items Ordered</h3>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Product</th>
                                            <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Qty</th>
                                            <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Unit</th>
                                            <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2.5 text-slate-900">{item.product_name}</td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">{item.quantity}</td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">₵{Number(item.unit_price).toFixed(2)}</td>
                                                <td className="px-4 py-2.5 text-right font-semibold text-slate-900">₵{Number(item.subtotal).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900 text-base">₵{Number(order.total_amount).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Shipping Address */}
                        {order.shipping_address && Object.keys(order.shipping_address).length > 0 && (
                            <div className="px-6 py-5">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Shipping Address</h3>
                                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 space-y-1">
                                    {order.shipping_address.street && <p>{order.shipping_address.street}</p>}
                                    {(order.shipping_address.city || order.shipping_address.region) && (
                                        <p>
                                            {[order.shipping_address.city, order.shipping_address.region].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                    {order.shipping_address.country && (
                                        <p>
                                            {order.shipping_address.country}
                                            {order.shipping_address.postal_code ? ` ${order.shipping_address.postal_code}` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section 4: Payment Info */}
                        {(order.paystack_reference || order.paystack_transaction_id) && (
                            <div className="px-6 py-5">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment Info</h3>
                                <div className="flex flex-wrap gap-3">
                                    {order.paystack_reference && (
                                        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                                            <p className="text-slate-400 text-xs mb-1">Paystack Reference</p>
                                            <p className="font-mono font-semibold text-slate-800">{order.paystack_reference}</p>
                                        </div>
                                    )}
                                    {order.paystack_transaction_id && (
                                        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                                            <p className="text-slate-400 text-xs mb-1">Transaction ID</p>
                                            <p className="font-mono font-semibold text-slate-800">{order.paystack_transaction_id}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section 5: Status Timeline */}
                        <div className="px-6 py-5">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Timeline</h3>
                            {order.status_history.length === 0 ? (
                                <p className="text-sm text-slate-400">No status changes recorded yet.</p>
                            ) : (
                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />
                                    <div className="space-y-4">
                                        {order.status_history.map((entry) => (
                                            <div key={entry.id} className="flex items-start gap-4 relative">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white ${STATUS_BADGE[entry.to_status] || 'bg-slate-100'}`}>
                                                    <span className="material-symbols-outlined text-sm">
                                                        {STATUS_ICON[entry.to_status] || 'radio_button_checked'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-semibold text-slate-900">
                                                            {entry.from_status
                                                                ? `${STATUS_LABEL[entry.from_status] || entry.from_status} → ${STATUS_LABEL[entry.to_status] || entry.to_status}`
                                                                : STATUS_LABEL[entry.to_status] || entry.to_status
                                                            }
                                                        </span>
                                                        <StatusBadge status={entry.to_status} />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className="text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                                                        <span className="text-xs text-slate-300">·</span>
                                                        <span className="text-xs text-slate-500">by {entry.changed_by_name}</span>
                                                    </div>
                                                    {entry.note && (
                                                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-lg px-3 py-1.5 italic">
                                                            "{entry.note}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 6: Update Status Form */}
                        <div className="px-6 py-5 bg-slate-50/50 rounded-b-2xl">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Update Status</h3>

                            {feedback && (
                                <div className={`mb-4 flex items-start gap-3 p-3 rounded-xl text-sm ${
                                    feedback.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                    <span className="material-symbols-outlined text-base flex-shrink-0">
                                        {feedback.type === 'success' ? 'check_circle' : 'error'}
                                    </span>
                                    <span>{feedback.message}</span>
                                    <button onClick={() => setFeedback(null)} className="ml-auto opacity-60 hover:opacity-100">
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </div>
                            )}

                            {allowedTransitions.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">
                                    No further status transitions available for this order.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select
                                            value={newStatus}
                                            onChange={e => setNewStatus(e.target.value)}
                                            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-700"
                                        >
                                            <option value="">Select new status…</option>
                                            {allowedTransitions.map(s => (
                                                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={!newStatus || updateStatus.isPending}
                                            className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                        >
                                            {updateStatus.isPending ? 'Updating…' : 'Update Status'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Optional note (e.g. tracking number, reason for cancellation)"
                                        rows={2}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminOrdersPage = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Build query params — omit empty values
    const filters = Object.fromEntries(
        Object.entries({ search, status: statusFilter, date_from: dateFrom, date_to: dateTo })
            .filter(([, v]) => v)
    );

    const { data: ordersResponse, isLoading, error, refetch } = useAdminOrders(filters);

    const orders = ordersResponse?.data ?? [];
    const meta = ordersResponse?.meta ?? {};

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
    };

    const hasFilters = search || statusFilter || dateFrom || dateTo;

    return (
        <DashboardLayout variant="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {meta.total != null
                                ? `${meta.total} order${meta.total !== 1 ? 's' : ''}`
                                : 'Loading…'}
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-700 min-w-40"
                    >
                        <option value="">All Statuses</option>
                        {Object.entries(STATUS_LABEL).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        title="From date"
                        className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-700"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        title="To date"
                        className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-700"
                    />
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Order Detail Modal */}
                {selectedOrderId && (
                    <OrderDetailModal
                        orderId={selectedOrderId}
                        onClose={() => setSelectedOrderId(null)}
                    />
                )}

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400">Loading orders…</div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-red-300">cloud_off</span>
                            <p className="text-red-500 font-medium mt-2">Failed to load orders</p>
                            <p className="text-slate-400 text-sm mt-1">{error.message}</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
                            <p className="text-slate-400 mt-2">
                                {hasFilters ? 'No orders match your filters.' : 'No orders yet.'}
                            </p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="mt-3 text-primary text-sm hover:underline">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Order #</th>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Customer</th>
                                        <th className="text-right px-5 py-3 font-semibold text-slate-600">Items</th>
                                        <th className="text-right px-5 py-3 font-semibold text-slate-600">Total</th>
                                        <th className="text-center px-5 py-3 font-semibold text-slate-600">Status</th>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedOrderId(order.id)}
                                        >
                                            <td className="px-5 py-3">
                                                <span className="font-mono font-semibold text-slate-700">#{order.order_number}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{order.customer_name}</p>
                                                        <p className="text-xs text-slate-400">{order.customer_email}</p>
                                                    </div>
                                                    {order.is_guest && (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 whitespace-nowrap">
                                                            Guest
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-600">{order.item_count}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-slate-900">
                                                ₵{Number(order.total_amount).toFixed(2)}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                                {formatShort(order.created_at)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                                    title="View order"
                                                >
                                                    <span className="material-symbols-outlined text-slate-500 text-base">open_in_new</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminOrdersPage;
