import { useState, useMemo } from 'react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useNests } from '../../modules/nest/hooks/useNests';
import AnimatedNestCard from '../../shared/components/ui/AnimatedNestCard';

const NestBrowsePage = () => {
    const { user } = useAuthStore();
    const { data: response, isLoading, isError } = useNests();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFocus, setSelectedFocus] = useState('All');

    const nests = useMemo(() => response?.data || [], [response?.data]);

    // Derived distinct focus areas for filtering
    const focusAreas = useMemo(() => {
        const areas = new Set(nests.map(nest => nest.focus_area).filter(Boolean));
        return ['All', ...Array.from(areas)];
    }, [nests]);

    // Derived filtered nests
    const filteredNests = useMemo(() => {
        return nests.filter(nest => {
            const matchesSearch = nest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                nest.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFocus = selectedFocus === 'All' || nest.focus_area === selectedFocus;
            return matchesSearch && matchesFocus;
        });
    }, [nests, searchQuery, selectedFocus]);

    return (
        <DashboardLayout variant={user?.role === 'eagle' ? 'eagle' : 'eaglet'}>
            <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-8 min-h-[calc(100vh-120px)] animate-fade-in">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60 transition-all duration-500">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                            Discover & Join Nests
                        </h1>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            Connect with mentors and peers. Filter by focus areas to find the community that aligns with your goals.
                        </p>
                    </div>

                    {/* Quick Search */}
                    <div className="w-full md:w-80 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform duration-300 group-focus-within:translate-x-1">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search nests by name or topic..."
                            className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Pills */}
                {!isLoading && focusAreas.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {focusAreas.map(focus => (
                            <button
                                key={focus}
                                onClick={() => setSelectedFocus(focus)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-out transform active:scale-95 ${selectedFocus === focus
                                    ? 'bg-primary text-white shadow-md shadow-primary/30 -translate-y-0.5'
                                    : 'bg-white/70 border border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
                                    }`}
                            >
                                {focus}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content States */}
                <div className="flex-1 w-full">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-72 rounded-2xl bg-white/40 border border-slate-200/50 p-5 flex flex-col justify-end relative overflow-hidden">
                                    {/* Shimmer overlay */}
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                    <div className="h-6 bg-slate-200/60 rounded-md w-3/4 mb-3" />
                                    <div className="h-4 bg-slate-200/60 rounded-md w-full mb-2" />
                                    <div className="h-4 bg-slate-200/60 rounded-md w-2/3" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-red-50/50 rounded-2xl border border-red-100 p-8">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">error</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to load Nests</h3>
                            <p className="text-slate-500 max-w-md">Please check your connection and try again later.</p>
                        </div>
                    ) : filteredNests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredNests.map((nest, index) => (
                                <AnimatedNestCard
                                    key={nest.id}
                                    title={nest.name}
                                    description={nest.description || 'No description provided.'}
                                    image={nest.image_url}
                                    icon="rocket_launch"
                                    iconColor="text-primary"
                                    memberCount={nest.members?.length || 0}
                                    additionalInfo={nest.focus_area}
                                    linkTo={`/eaglet/nest/${nest.id}`}
                                    delay={index * 50}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/40 rounded-3xl border border-dashed border-slate-200">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-2 bg-primary/20 rounded-full animate-pulse" />
                                <div className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-primary text-3xl">search_off</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Nests Found</h3>
                            <p className="text-slate-500">We couldn't find any nests matching your search criteria.</p>
                            {(searchQuery || selectedFocus !== 'All') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedFocus('All'); }}
                                    className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NestBrowsePage;
