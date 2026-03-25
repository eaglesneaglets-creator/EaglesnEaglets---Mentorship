import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductDetail } from '../../modules/store/hooks/useStore';
import { useAddToCart } from '../../modules/store/hooks/useCart';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const [quantity, setQuantity] = useState(1);
    const { data, isLoading, isError } = useProductDetail(slug);
    const addToCart = useAddToCart();

    const product = data?.data;

    const handleAddToCart = () => {
        if (!product) return;
        addToCart.mutate(
            { product_id: product.id, quantity },
            {
                onSuccess: () => toast.success(`${product.name} added to cart!`),
                onError: (err) => toast.error(err.message || 'Failed to add to cart'),
            }
        );
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (isError || !product) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <p className="text-slate-400">Product not found.</p>
                <Link to="/store" className="text-primary text-sm mt-2 block">← Back to Store</Link>
            </div>
        </div>
    );

    const primaryImage = product.images?.find(i => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link to="/store" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Store
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="aspect-square bg-slate-50 flex items-center justify-center">
                        {primaryImage ? (
                            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-6xl text-slate-300">shopping_bag</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-8 flex flex-col">
                        {product.category && (
                            <p className="text-sm text-primary font-medium mb-2">{product.category.name}</p>
                        )}
                        <h1 className="text-2xl font-bold text-slate-900 mb-3">{product.name}</h1>
                        <p className="text-3xl font-bold text-primary mb-4">₦{Number(product.price).toLocaleString()}</p>

                        {product.description && (
                            <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.description}</p>
                        )}

                        <p className="text-xs text-slate-400 mb-4">
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                        </p>

                        {/* Quantity + Add */}
                        <div className="flex items-center gap-3 mt-auto">
                            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-600 font-bold">−</button>
                                <span className="px-4 py-2 font-semibold text-slate-900 text-sm">{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-600 font-bold">+</button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock_quantity === 0 || addToCart.isPending}
                                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
