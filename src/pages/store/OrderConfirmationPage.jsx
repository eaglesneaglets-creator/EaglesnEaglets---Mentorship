import { useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useOrderDetail } from '../../modules/store/hooks/useOrders';
import { useAuthStore } from '@store';
import { useQuery } from '@tanstack/react-query';
import StoreService from '../../modules/store/services/store-service';
import StoreHeader from '../../modules/store/components/StoreHeader';
import PaystackCheckout from '../../modules/store/components/PaystackCheckout';

const STATUS_CONFIG = {
  pending: {
    icon: 'schedule',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Order Placed',
    message: 'Your order has been received and is awaiting payment.',
  },
  payment_pending: {
    icon: 'payment',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Awaiting Payment',
    message: 'Complete your payment to confirm this order.',
  },
  paid: {
    icon: 'check_circle',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'Payment Confirmed',
    message: 'Your payment was successful. Your order is being processed.',
  },
  processing: {
    icon: 'inventory',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Processing',
    message: 'Your order is being prepared.',
  },
  shipped: {
    icon: 'local_shipping',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    title: 'Shipped',
    message: 'Your order is on the way.',
  },
  delivered: {
    icon: 'check_circle',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'Delivered',
    message: 'Your order has been delivered. Enjoy!',
  },
  cancelled: {
    icon: 'cancel',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'Cancelled',
    message: 'This order has been cancelled.',
  },
};

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Placed', icon: 'receipt' },
  { key: 'payment', label: 'Payment', icon: 'payment' },
  { key: 'processing', label: 'Processing', icon: 'inventory' },
  { key: 'shipped', label: 'Shipped', icon: 'local_shipping' },
  { key: 'delivered', label: 'Delivered', icon: 'check_circle' },
];

const getStepStatus = (stepKey, orderStatus) => {
  const order = ['placed', 'payment', 'processing', 'shipped', 'delivered'];
  const statusToStep = {
    pending: 0,
    payment_pending: 1,
    paid: 2,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };
  const currentStep = statusToStep[orderStatus] ?? 0;
  const stepIndex = order.indexOf(stepKey);
  if (orderStatus === 'cancelled') return 'cancelled';
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'upcoming';
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const shouldVerify = searchParams.get('verify') === '1';

  // Guest order passed via navigation state (avoids extra API call)
  const guestOrderFromState = location.state?.guestOrder;

  // Auth users: fetch from the authenticated order endpoint
  const { data: authOrderData, isLoading: authLoading } = useOrderDetail(id);

  // Guest users without state: fetch from the public guest order endpoint
  const { data: guestOrderData, isLoading: guestLoading } = useQuery({
    queryKey: ['store', 'guest-orders', id],
    queryFn: () => StoreService.getGuestOrderDetail(id),
    enabled: !isAuthenticated && !guestOrderFromState && !!id,
  });

  const isLoading = isAuthenticated ? authLoading : (!guestOrderFromState && guestLoading);
  const order = isAuthenticated
    ? (authOrderData?.data ?? authOrderData)
    : (guestOrderFromState ?? guestOrderData?.data ?? guestOrderData);
  const config = STATUS_CONFIG[order?.status] ?? STATUS_CONFIG.pending;

  // Poll /verify/ every 3s (max 10 attempts) when ?verify=1 is present.
  // When order becomes 'paid', reload the page cleanly to show the paid state.
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!shouldVerify || !id || order?.status === 'paid') return;

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      try {
        const res = await StoreService.verifyPayment(id);
        const updated = res?.data ?? res;
        if (updated?.status === 'paid') {
          clearInterval(pollRef.current);
          // Hard navigate to strip ?verify=1 and reload with fresh order data
          window.location.replace(`/store/orders/${id}`);
        }
      } catch {
        // Silently ignore transient errors during polling
      }
      if (pollCountRef.current >= 10) {
        clearInterval(pollRef.current);
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [shouldVerify, id, order?.status]);

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
        ) : !order ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Order not found.</p>
            <Link to="/store" className="mt-4 inline-block text-primary hover:underline">Back to Store</Link>
          </div>
        ) : (
          <>
            {/* Status card */}
            <div className={`rounded-2xl border p-6 text-center ${config.bg} ${config.border} mb-6`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${config.bg} ${
                order.status === 'paid' || order.status === 'delivered' ? 'animate-bounce-once' : ''
              }`}>
                <span className={`material-symbols-outlined text-3xl ${config.color}`}>{config.icon}</span>
              </div>
              <h2 className={`text-xl font-bold ${config.color}`}>{config.title}</h2>
              <p className="text-slate-600 text-sm mt-1">{config.message}</p>
              <p className="text-xs text-slate-400 mt-2">Order #{String(order.id).substring(0, 8).toUpperCase()}</p>
            </div>

            {/* Timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Order Progress</h3>
                <div className="flex items-center justify-between w-full">
                  {TIMELINE_STEPS.map((step, i) => {
                    const stepStatus = getStepStatus(step.key, order.status);
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className="flex items-center w-full">
                          {i > 0 && (
                            <div className={`flex-1 h-0.5 ${stepStatus === 'upcoming' ? 'bg-slate-200' : 'bg-primary'}`} />
                          )}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            stepStatus === 'completed' ? 'bg-primary text-white' :
                            stepStatus === 'current' ? 'bg-primary/10 text-primary border-2 border-primary' :
                            stepStatus === 'cancelled' ? 'bg-red-100 text-red-500' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            <span className="material-symbols-outlined text-base">
                              {stepStatus === 'completed' ? 'check' : step.icon}
                            </span>
                          </div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 ${
                              getStepStatus(TIMELINE_STEPS[i + 1].key, order.status) === 'upcoming' ? 'bg-slate-200' : 'bg-primary'
                            }`} />
                          )}
                        </div>
                        <span className={`text-xs font-medium mt-1.5 ${
                          stepStatus === 'completed' || stepStatus === 'current' ? 'text-slate-700' : 'text-slate-400'
                        }`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment CTA (MM-20) */}
            {(order.status === 'pending' || order.status === 'payment_pending') && (
              shouldVerify ? (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-blue-700 text-sm font-medium">Verifying your payment&hellip;</p>
                </div>
              ) : (
                <PaystackCheckout order={order} />
              )
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Order Items</h3>
              <div className="divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                      {item.product?.primary_image ? (
                        <img src={item.product.primary_image} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-300 text-base">shopping_bag</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product?.name ?? item.product_name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity} × ₵{Number(item.unit_price).toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                      ₵{(Number(item.unit_price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 mt-2 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-primary text-lg">₵{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/store" className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-2xl text-center hover:bg-slate-50 transition-colors text-sm">
                Continue Shopping
              </Link>
              {isAuthenticated && (
                <Link to="/store/orders" className="flex-1 py-3 bg-primary text-white font-semibold rounded-2xl text-center hover:bg-primary/90 transition-colors text-sm">
                  View All Orders
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
