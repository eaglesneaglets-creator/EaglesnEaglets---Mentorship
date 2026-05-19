import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '../../modules/store/hooks/useCart';
import { useCreateOrder } from '../../modules/store/hooks/useOrders';
import { useAuthStore } from '@store';
import toast from 'react-hot-toast';
import StoreHeader from '../../modules/store/components/StoreHeader';
import { sanitizeImageUrl } from '../../shared/utils/sanitize';

const CartPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    const { data: cartData, isLoading } = useCart();
    const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
    const { mutate: removeItem } = useRemoveFromCart();
    const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const items = cartData?.data?.items ?? [];
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.unit_price) * item.quantity,
        0,
    );

    const handleUpdateQty = (itemId, newQty) => {
        if (newQty < 1) return;
        updateItem({ id: itemId, quantity: newQty });
    };

    const handleRemove = (itemId) => removeItem(itemId);

    const handleCheckout = () => {
        createOrder({}, {
            onSuccess: (res) => {
                const orderId = res?.data?.id ?? res?.id;
                toast.success('Order placed! Redirecting...');
                navigate(`/store/orders/${orderId}`);
            },
            onError: (err) => toast.error(err.message || 'Failed to create order'),
        });
    };

    if (isLoading) {
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
                                                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || isUpdating}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">remove</span>
                                            </button>
                                            <span className="w-9 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                                disabled={isUpdating}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">add</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.id)}
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
