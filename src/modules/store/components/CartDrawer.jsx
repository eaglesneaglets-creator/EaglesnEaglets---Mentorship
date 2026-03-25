import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '../hooks/useCart';

const CartDrawer = ({ isOpen, onClose }) => {
    const { data: cartData, isLoading } = useCart();
    const removeItem = useRemoveFromCart();
    const updateItem = useUpdateCartItem();
    const navigate = useNavigate();

    const cart = cartData?.data;
    const items = cart?.items ?? [];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-lg">
                        Cart
                        {cart?.item_count > 0 && (
                            <span className="ml-2 text-sm font-normal text-slate-500">({cart.item_count} items)</span>
                        )}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {isLoading ? (
                        <p className="text-sm text-slate-400 text-center py-8">Loading cart...</p>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-4xl text-slate-300">shopping_cart</span>
                            <p className="text-sm text-slate-400 mt-2">Your cart is empty</p>
                        </div>
                    ) : items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            {item.primary_image ? (
                                <img src={item.primary_image} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-50" />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-slate-400">shopping_bag</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{item.product_name}</p>
                                <p className="text-xs text-slate-500">₦{Number(item.unit_price).toLocaleString()}</p>
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        onClick={() => item.quantity > 1
                                            ? updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })
                                            : removeItem.mutate(item.id)
                                        }
                                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600"
                                    >−</button>
                                    <span className="text-sm font-semibold text-slate-900 w-5 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600"
                                    >+</button>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-slate-900">₦{Number(item.subtotal).toLocaleString()}</p>
                                <button onClick={() => removeItem.mutate(item.id)} className="text-xs text-red-400 hover:text-red-600 mt-1">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">Total</span>
                            <span className="text-xl font-bold text-primary">₦{Number(cart?.total ?? 0).toLocaleString()}</span>
                        </div>
                        <button
                            onClick={() => { onClose(); navigate('/store/cart'); }}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

CartDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CartDrawer;
