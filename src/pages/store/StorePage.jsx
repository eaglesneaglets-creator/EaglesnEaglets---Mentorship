import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../../modules/store/hooks/useStore';
import { useAddToCart, useCartCount } from '../../modules/store/hooks/useCart';
import ProductCard from '../../modules/store/components/ProductCard';
import CartDrawer from '../../modules/store/components/CartDrawer';
import toast from 'react-hot-toast';

const StorePage = () => {
    const [activeCategory, setActiveCategory] = useState('');
    const [search, setSearch] = useState('');
    const [cartOpen, setCartOpen] = useState(false);

    const { data: productsData, isLoading } = useProducts(
        activeCategory || search
            ? Object.fromEntries(
                [activeCategory && ['category', activeCategory], search && ['search', search]].filter(Boolean)
              )
            : {}
    );
    const { data: categoriesData } = useCategories();
    const addToCart = useAddToCart();
    const cartCount = useCartCount();

    const products = productsData?.data ?? [];
    const categories = categoriesData?.data ?? [];

    const handleAddToCart = (product) => {
        addToCart.mutate(
            { product_id: product.id, quantity: 1 },
            {
                onSuccess: () => toast.success(`${product.name} added to cart!`),
                onError: (err) => toast.error(err.message || 'Failed to add to cart'),
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Store Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-base">storefront</span>
                        </div>
                        <span className="font-bold text-slate-900 hidden sm:block">Eagles & Eaglets</span>
                        <span className="text-slate-400 hidden sm:block">|</span>
                        <span className="text-sm font-semibold text-primary hidden sm:block">Store</span>
                    </Link>

                    {/* Search */}
                    <div className="flex-1 max-w-md relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 border-none text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Cart */}
                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-700">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </button>

                        <Link to="/login" className="hidden sm:block text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveCategory('')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.slug === activeCategory ? '' : cat.slug)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${cat.slug === activeCategory ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-5xl text-slate-300">storefront</span>
                        <p className="text-slate-400 mt-3">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                isAddingToCart={addToCart.isPending}
                            />
                        ))}
                    </div>
                )}
            </main>

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
};

export default StorePage;
