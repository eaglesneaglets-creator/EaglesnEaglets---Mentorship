import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '../../modules/store/hooks/useCart';
import { useGuestCart } from '../../modules/store/hooks/useGuestCart';
import { useCreateOrder } from '../../modules/store/hooks/useOrders';
import { useAuthStore } from '@store';
import StoreService from '../../modules/store/services/store-service';
import toast from 'react-hot-toast';
import StoreHeader from '../../modules/store/components/StoreHeader';
import { sanitizeImageUrl } from '../../shared/utils/sanitize';

const CartPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    // Auth user cart (API-backed)
    const { data: cartData, isLoading } = useCart();
    const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
    const { mutate: removeItem } = useRemoveFromCart();
    const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

    // Guest cart (localStorage)
    const guestCart = useGuestCart();

    // Guest checkout form state
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestForm, setGuestForm] = useState({ name: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Unified items + subtotal
    const items = isAuthenticated
        ? (cartData?.data?.items ?? [])
        : guestCart.items;

    const subtotal = isAuthenticated
        ? items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0)
        : guestCart.total;

    const handleUpdateQty = (itemId, newQty) => {
        if (newQty < 1) return;
        if (isAuthenticated) {
            updateItem({ id: itemId, quantity: newQty });
        } else {
            guestCart.updateItem(itemId, newQty);
        }
    };

    const handleRemove = (itemId) => {
        if (isAuthenticated) {
            removeItem(itemId);
        } else {
            guestCart.removeItem(itemId);
        }
    };

    const handleCheckout = () => {
        if (isAuthenticated) {
            createOrder({}, {
                onSuccess: (res) => {
                    const orderId = res?.data?.id ?? res?.id;
                    toast.success('Order placed! Redirecting...');
                    navigate(`/store/orders/${orderId}`);
                },
                onError: (err) => toast.error(err.message || 'Failed to create order'),
            });
        } else {
            setShowGuestForm(true);
        }
    };

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        if (!guestForm.name.trim() || !guestForm.email.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await StoreService.guestCheckout({
                guest_name: guestForm.name,
                guest_email: guestForm.email,
                items: guestCart.items.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                })),
            });
            guestCart.clearCart();
            const orderData = res?.data ?? res;
            const orderId = orderData?.id;
            toast.success('Order placed! Check your email for confirmation.');
            navigate(`/store/orders/${orderId}`, { state: { guestOrder: orderData } });
        } catch (err) {
            toast.error(err.message || 'Failed to place order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthenticated && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <StoreHeader forceScrolled />

            <div className="max-w-6xl mx-auto px-4 pt-28 pb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">
                    Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-7xl text-slate-200">shopping_bag</span>
                        <h2 className="text-xl font-bold text-slate-700 mt-4">Your cart is empty</h2>
                        <p className="text-slate-500 text-sm mt-2">Add some products to get started</p>
                        <Link
                            to="/store"
                            className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-colors text-sm"
                        >
                            <span className="material-symbols-outlined text-base">storefront</span>
                            Browse Store
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            {item.primary_image ? (
                                                <img src={sanitizeImageUrl(item.primary_image)} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-300 text-2xl">shopping_bag</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-sm leading-tight truncate">{item.product_name}</p>
                                            <p className="text-sm text-slate-500 mt-0.5">₵{Number(item.unit_price).toLocaleString()} each</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-slate-900">
                                                ₵{(Number(item.unit_price) * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => handleUpdateQty(item.product_id ?? item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || isUpdating}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">remove</span>
                                            </button>
                                            <span className="w-9 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQty(item.product_id ?? item.id, item.quantity + 1)}
                                                disabled={isUpdating}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">add</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.product_id ?? item.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                                        >
                                            <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-red-500 transition-colors">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-80 xl:w-96 flex-shrink-0">
                            <div className="sticky top-20">
                                {showGuestForm ? (
                                    /* Guest checkout form */
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                        <h2 className="font-bold text-slate-900 mb-1">Complete Your Order</h2>
                                        <p className="text-sm text-slate-500 mb-4">No account needed — just your name and email.</p>
                                        <form onSubmit={handleGuestSubmit} className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestForm.name}
                                                    onChange={(e) => setGuestForm((p) => ({ ...p, name: e.target.value }))}
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={guestForm.email}
                                                    onChange={(e) => setGuestForm((p) => ({ ...p, email: e.target.value }))}
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Placing Order...
                                                    </>
                                                ) : 'Place Order'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowGuestForm(false)}
                                                className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors mt-1"
                                            >
                                                ← Back to cart
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    /* Normal order summary */
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                        <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Subtotal ({items.length} items)</span>
                                                <span className="font-semibold text-slate-900">₵{subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Shipping</span>
                                                <span className="text-slate-400 italic">Calculated at checkout</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between">
                                            <span className="font-bold text-slate-900">Total</span>
                                            <span className="font-bold text-primary text-xl">₵{subtotal.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={items.length === 0 || isCreatingOrder}
                                            className="w-full mt-5 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                        >
                                            {isCreatingOrder ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Placing Order...
                                                </>
                                            ) : 'Proceed to Checkout'}
                                        </button>
                                        <Link to="/store" className="block text-center text-sm text-slate-500 hover:text-primary transition-colors mt-3">
                                            Continue Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
