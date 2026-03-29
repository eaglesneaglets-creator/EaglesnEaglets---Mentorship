import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '../hooks/useCart';

const CartDrawer = ({ isOpen, onClose }) => {
    const { data: cartData, isLoading } = useCart();
    const { mutate: removeItem, variables: removingId, isPending: isRemoving } = useRemoveFromCart();
    const { mutate: updateItem } = useUpdateCartItem();

    const cart = cartData?.data;
    const items = cart?.items ?? [];

    return (
        <>
            {/* Overlay — fades in/out */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer — slides in from right */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-lg">
                        Cart
                        {cart?.item_count > 0 && (
                            <span className="ml-2 text-sm font-normal text-slate-500">
                                ({cart.item_count} items)
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Close cart"
                    >
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
                    ) : (
                        items.map((item) => {
                            const isBeingRemoved = isRemoving && removingId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-start gap-3 transition-opacity duration-200 ${isBeingRemoved ? 'opacity-40' : 'opacity-100'}`}
                                >
                                    {/* Product image — 32×32 */}
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 mt-0.5">
                                        {item.primary_image ? (
                                            <img
                                                src={item.primary_image}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">
                                                    shopping_bag
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name + price + qty controls */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                                            {item.product_name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {item.quantity} × ₵{Number(item.unit_price).toLocaleString()}
                                        </p>
                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <button
                                                onClick={() =>
                                                    item.quantity > 1
                                                        ? updateItem({ id: item.id, quantity: item.quantity - 1 })
                                                        : removeItem(item.id)
                                                }
                                                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="text-sm font-semibold text-slate-900 w-5 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
                                                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal + remove */}
                                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                                        <p className="text-sm font-bold text-slate-900">
                                            ₵{Number(item.subtotal ?? Number(item.unit_price) * item.quantity).toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1 rounded-md hover:bg-red-50 transition-colors group"
                                            title="Remove item"
                                            disabled={isBeingRemoved}
                                        >
                                            <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-red-500 transition-colors">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">Total</span>
                            <span className="text-xl font-bold text-primary">
                                ₵{Number(cart?.total ?? 0).toLocaleString()}
                            </span>
                        </div>
                        <Link
                            to="/store/cart"
                            onClick={onClose}
                            className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-center text-sm"
                        >
                            View Cart
                        </Link>
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
