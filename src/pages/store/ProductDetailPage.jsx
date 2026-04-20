import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductBySlug, useProducts } from '../../modules/store/hooks/useStore';
import { useAddToCart } from '../../modules/store/hooks/useCart';
import { useGuestCart } from '../../modules/store/hooks/useGuestCart';
import { useAuthStore } from '@store';
import ProductCard from '../../modules/store/components/ProductCard';
import StoreHeader from '../../modules/store/components/StoreHeader';
import { sanitizeImageUrl } from '../../shared/utils/sanitize';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const { isAuthenticated } = useAuthStore();
    const [activeImage, setActiveImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [addedFeedback, setAddedFeedback] = useState(false);

    const { data: productData, isLoading } = useProductBySlug(slug);
    const { data: productsData } = useProducts();
    const addToCartMutation = useAddToCart();
    const guestCart = useGuestCart();

    const product = productData?.data;
    const products = productsData?.data?.results ?? productsData?.data ?? [];

    const isOutOfStock = product?.stock_quantity === 0;
    const isAdding = addToCartMutation.isPending;
    const maxQty = product?.stock_quantity ?? 1;

    const images =
        product?.images?.length > 0
            ? product.images
            : [{ image_url: `https://picsum.photos/seed/${product?.slug ?? slug}/600/600`, id: 'placeholder' }];

    const stockPercent = product
        ? Math.min(100, Math.round((product.stock_quantity / 50) * 100))
        : 0;

    const related = product
        ? products
              .filter(
                  (p) =>
                      p.category_name === product.category_name &&
                      p.slug !== product.slug
              )
              .slice(0, 4)
        : [];

    const handleAddToCart = () => {
        if (!product || isOutOfStock) return;
        if (!isAuthenticated) {
            // Guest: add to localStorage cart directly, no login required
            guestCart.addItem(product, qty);
            setAddedFeedback(true);
            setTimeout(() => setAddedFeedback(false), 2000);
            return;
        }
        addToCartMutation.mutate(
            { product_id: product.id, quantity: qty },
            {
                onSuccess: () => {
                    setAddedFeedback(true);
                    setTimeout(() => setAddedFeedback(false), 2000);
                },
                onError: (err) => {
                    alert(err.message || 'Failed to add to cart');
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24">
            <StoreHeader forceScrolled />

            {/* Loading skeleton */}
            {isLoading && (
                <div className="max-w-6xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 animate-pulse">
                        <div className="md:col-span-3 aspect-square bg-slate-200 rounded-2xl" />
                        <div className="md:col-span-2 space-y-4">
                            <div className="h-6 bg-slate-200 rounded w-24" />
                            <div className="h-8 bg-slate-200 rounded w-3/4" />
                            <div className="h-10 bg-slate-200 rounded w-1/3" />
                            <div className="h-20 bg-slate-200 rounded" />
                        </div>
                    </div>
                </div>
            )}

            {/* 404 state */}
            {!isLoading && !product && (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
                    <h2 className="text-xl font-bold text-slate-700 mt-4">Product not found</h2>
                    <Link
                        to="/store"
                        className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to Store
                    </Link>
                </div>
            )}

            {/* Main content */}
            {!isLoading && product && (
                <main className="max-w-6xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-slate-400 flex items-center gap-1 flex-wrap mb-6">
                        <Link to="/store" className="hover:text-primary transition-colors">
                            Store
                        </Link>
                        <span>/</span>
                        {product.category_name && (
                            <>
                                <span className="hover:text-primary transition-colors cursor-pointer">
                                    {product.category_name}
                                </span>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-slate-600 font-medium truncate max-w-xs">
                            {product.name}
                        </span>
                    </nav>

                    {/* 2-column layout */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
                        {/* Image gallery — 3/5 */}
                        <div className="md:col-span-3">
                            <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square">
                                <img
                                    src={sanitizeImageUrl(images[activeImage]?.image_url)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                    {images.map((img, i) => (
                                        <button
                                            key={img.id || i}
                                            onClick={() => setActiveImage(i)}
                                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                                i === activeImage
                                                    ? 'border-primary'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <img
                                                src={img.image_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product info — 2/5 */}
                        <div className="md:col-span-2 flex flex-col gap-4">
                            {/* Category badge */}
                            {product.category_name && (
                                <span className="bg-primary/10 text-primary text-xs font-semibold rounded-full px-3 py-1 inline-block self-start">
                                    {product.category_name}
                                </span>
                            )}

                            {/* Name */}
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 leading-tight">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <p className="text-3xl font-bold text-primary mt-2">
                                ₵{Number(product.price).toLocaleString()}
                            </p>

                            {/* Description */}
                            {product.description && (
                                <div className="prose prose-sm text-slate-600 mt-4 max-w-none">
                                    <p>{product.description}</p>
                                </div>
                            )}

                            {/* Stock indicator */}
                            <div className="mt-2">
                                {isOutOfStock ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full">
                                        <span className="material-symbols-outlined text-base">block</span>
                                        Out of Stock
                                    </span>
                                ) : product.stock_quantity <= 5 ? (
                                    <div>
                                        <div className="flex justify-between text-xs text-amber-600 font-medium mb-1">
                                            <span>Low Stock</span>
                                            <span>{product.stock_quantity} remaining</span>
                                        </div>
                                        <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all"
                                                style={{ width: `${stockPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full">
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                        In Stock
                                    </span>
                                )}
                            </div>

                            {/* Quantity stepper */}
                            {!isOutOfStock && (
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm font-medium text-slate-700">Quantity</span>
                                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                            disabled={qty <= 1}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">remove</span>
                                        </button>
                                        <span className="w-10 text-center font-semibold text-slate-900 text-sm">
                                            {qty}
                                        </span>
                                        <button
                                            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                                            disabled={qty >= maxQty}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">add</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Add to Cart button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || isAdding}
                                className="w-full py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {isAdding ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : addedFeedback ? (
                                    <>
                                        <span className="material-symbols-outlined text-base">check</span>
                                        Added!
                                    </>
                                ) : isOutOfStock ? (
                                    'Out of Stock'
                                ) : (
                                    'Add to Cart'
                                )}
                            </button>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 mt-2">
                                {[
                                    { icon: 'lock', label: 'Secure Checkout' },
                                    { icon: 'replay', label: 'Easy Returns' },
                                    { icon: 'local_shipping', label: 'Fast Delivery' },
                                ].map((badge) => (
                                    <div
                                        key={badge.label}
                                        className="flex flex-col items-center gap-1 text-center"
                                    >
                                        <span className="material-symbols-outlined text-slate-400 text-xl">
                                            {badge.icon}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {badge.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related products */}
                    {related.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-xl font-bold text-slate-900 mb-5">
                                You might also like
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {related.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            )}
        </div>
    );
};

export default ProductDetailPage;
