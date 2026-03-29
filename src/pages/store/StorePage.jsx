import { useState } from 'react';
import { useProducts, useCategories } from '../../modules/store/hooks/useStore';
import ProductCard from '../../modules/store/components/ProductCard';
import StoreHeader from '../../modules/store/components/StoreHeader';

const StorePage = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { data: productsData, isLoading, isError } = useProducts();
    const { data: categoriesData } = useCategories();
    const products = productsData?.data ?? [];
    const categories = categoriesData?.data ?? [];

    const filteredProducts = products.filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || p.category_slug === selectedCategory || p.category?.slug === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <StoreHeader />

            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-primary to-emerald-600 text-white py-14 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Eagles &amp; Eaglets Store</h1>
                    <p className="text-emerald-100 text-lg mb-6">Gear up for your mentorship journey</p>
                    {/* Search bar */}
                    <div className="max-w-md mx-auto relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/50 text-sm shadow-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Category Pill Tabs */}
            <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-2 overflow-x-auto py-2 px-4 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                                selectedCategory === null
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                            }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                                    cat.slug === selectedCategory
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Error state */}
                {isError && (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-6xl text-red-300">error</span>
                        <p className="text-slate-500 font-medium mt-3">Failed to load products</p>
                        <p className="text-slate-400 text-sm mt-1">Please try refreshing the page</p>
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden animate-pulse">
                                <div className="aspect-square bg-slate-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !isError && filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
                        <p className="text-slate-500 font-medium mt-3">No products found</p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="mt-3 text-primary text-sm hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Product Grid */}
                {!isLoading && !isError && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 mt-16 py-8 text-center text-slate-400 text-sm">
                <p>© 2026 Eagles &amp; Eaglets. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default StorePage;
