import { useNavigate } from 'react-router-dom';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '../../modules/store/hooks/useCart';
import { useCreateOrder } from '../../modules/store/hooks/useOrders';
import toast from 'react-hot-toast';

const CartPage = () => {
    const navigate = useNavigate();
    const { data: cartData, isLoading } = useCart();
    const removeItem = useRemoveFromCart();
    const updateItem = useUpdateCartItem();
    const createOrder = useCreateOrder();

    const cart = cartData?.data;
    const items = cart?.items ?? [];

    const handleCheckout = () => {
        createOrder.mutate({}, {
            onSuccess: (res) => {
                const orderId = res?.data?.id;
                toast.success('Order placed! Redirecting...');
                navigate(`/store/orders/${orderId}`);
            },
            onError: (err) => toast.error(err.message || 'Failed to place order'),
        });
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/60">
                        <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
                        <p className="text-slate-400 mt-3 mb-6">Your cart is empty</p>
                        <button onClick={() => navigate('/store')} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                            Browse Store
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-200/60">
                                    {item.primary_image ? (
                                        <img src={item.primary_image} alt={item.product_name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-slate-400">shopping_bag</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900">{item.product_name}</p>
                                        <p className="text-sm text-slate-500">₦{Number(item.unit_price).toLocaleString()} each</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => item.quantity > 1 ? updateItem.mutate({ id: item.id, quantity: item.quantity - 1 }) : removeItem.mutate(item.id)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700">−</button>
                                            <span className="w-6 text-center font-semibold">{item.quantity}</span>
                                            <button onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700">+</button>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-slate-900">₦{Number(item.subtotal).toLocaleString()}</p>
                                        <button onClick={() => removeItem.mutate(item.id)} className="text-xs text-red-400 hover:text-red-600 mt-1">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 h-fit">
                            <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal ({cart?.item_count} items)</span>
                                    <span>₦{Number(cart?.total ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-medium">Calculated at checkout</span>
                                </div>
                                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                                    <span>Total</span>
                                    <span className="text-primary text-lg">₦{Number(cart?.total ?? 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={createOrder.isPending}
                                className="w-full mt-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {createOrder.isPending ? 'Placing Order...' : 'Place Order'}
                            </button>
                            <p className="text-xs text-slate-400 text-center mt-3">
                                You will be redirected to payment after placing your order.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
