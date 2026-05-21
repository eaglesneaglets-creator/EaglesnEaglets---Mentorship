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

            {/* Hero Banner — glossy emerald gradient matching the rest of the platform */}
            <div className="relative bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 text-white pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 lg:pb-16 px-4 sm:px-6 overflow-hidden">
                {/* Glossy sheen overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/[0.03] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/25 via-transparent to-transparent pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                    }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                <div className="relative max-w-5xl mx-auto text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-[0_2px_8px_rgba(6,78,59,0.25)]">Eagles &amp; Eaglets Store</h1>
                    <p className="text-emerald-100 text-sm sm:text-base md:text-lg mb-5 sm:mb-6">Gear up for your mentorship journey</p>
                    {/* Search bar */}
                    <div className="max-w-md mx-auto relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/50 text-sm shadow-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Category Pill Tabs */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-2 overflow-x-auto py-2 px-4 sm:px-6 scrollbar-hide">
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
                        {(search || selectedCategory) && (
                            <div className="flex gap-3 justify-center mt-3">
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="text-primary text-sm hover:underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-primary text-sm hover:underline"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Product Grid */}
                {!isLoading && !isError && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onCategoryClick={(slug) => setSelectedCategory(slug)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 mt-12 sm:mt-16 py-6 sm:py-8 text-center text-slate-400 text-xs sm:text-sm px-4">
                <p>© {new Date().getFullYear()} Eagles &amp; Eaglets. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default StorePage;
