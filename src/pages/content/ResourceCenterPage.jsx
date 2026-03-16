import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useModules, useMyProgress } from '../../modules/content/hooks/useContent';
import { useMyNests } from '../../modules/nest/hooks/useNests';

/* ─── Soft animated background ─── */
const AnimatedBg = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-20 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl"
        />
        <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-green-100/20 rounded-full blur-3xl"
        />
    </div>
);

/* ─── Type config ─── */
const TYPE_CONFIG = {
    video: { label: 'VIDEO', badge: 'bg-primary text-white', icon: 'play_circle', sectionIcon: 'play_circle', sectionColor: 'text-primary' },
    document: { label: 'PDF', badge: 'bg-red-500 text-white', icon: 'description', sectionIcon: 'description', sectionColor: 'text-emerald-600' },
    reading: { label: 'GUIDE', badge: 'bg-blue-600 text-white', icon: 'link', sectionIcon: 'link', sectionColor: 'text-blue-600' },
    quiz: { label: 'QUIZ', badge: 'bg-amber-500 text-white', icon: 'quiz', sectionIcon: 'quiz', sectionColor: 'text-amber-600' },
};

/* ─── Featured Resource Card (large, with thumbnail) ─── */
const FeaturedCard = ({ item, module, onClick, delay = 0 }) => {
    const type = item?.content_type || module?.primary_type || 'reading';
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.reading;
    const title = item?.title || module?.title || 'Untitled';
    const description = item?.description || module?.description || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            onClick={onClick}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
        >
            {/* Thumbnail */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
                {module?.thumbnail_url ? (
                    <img src={module.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300">{config.icon}</span>
                    </div>
                )}
                {/* Type badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${config.badge}`}>
                    {config.label}
                </span>
            </div>

            {/* Body */}
            <div className="p-5">
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {description || 'Explore this resource to enhance your learning journey.'}
                </p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                    View Resource
                </motion.button>
            </div>
        </motion.div>
    );
};

/* ─── Compact Row Item (for Videos, Documents, Links sections) ─── */
const CompactItem = ({ item, module, onClick, delay = 0 }) => {
    const type = item?.content_type || 'reading';
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.reading;

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay * 0.05 }}
            onClick={onClick}
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200/70 cursor-pointer hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-0.5 transition-all duration-300"
        >
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">{config.icon}</span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {item?.title || 'Untitled'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {type === 'video' && item?.duration_minutes ? `Duration: ${item.duration_minutes} min` : ''}
                    {type === 'document' && item?.file_size ? `PDF · ${formatFileSize(item.file_size)}` : ''}
                    {type === 'reading' ? 'External Resource' : ''}
                    {!item?.duration_minutes && !item?.file_size && type !== 'reading' ? config.label : ''}
                </p>
            </div>
            {/* Action arrow / download */}
            <button className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-lg transition-colors">
                    {type === 'document' ? 'download' : type === 'reading' ? 'open_in_new' : 'chevron_right'}
                </span>
            </button>
        </motion.div>
    );
};

/* ─── Link Row (for Useful Links section) ─── */
const LinkItem = ({ item, onClick, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: delay * 0.05 }}
        onClick={onClick}
        className="group flex items-center gap-3 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-all border-b border-slate-100 last:border-b-0"
    >
        <span className="material-symbols-outlined text-slate-400 text-xl">language</span>
        <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-primary transition-colors truncate">
            {item?.title || 'Untitled Link'}
        </span>
        <span className="material-symbols-outlined text-slate-300 text-lg group-hover:text-primary transition-colors">open_in_new</span>
    </motion.div>
);

/* ─── Progress Bar (sidebar) ─── */
const ProgressBar = ({ value, max }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-bold text-slate-700">Resources Completed</span>
                <span className="text-sm font-bold text-slate-900">{value}/{max}</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-full"
                />
            </div>
        </div>
    );
};

/* ─── Helpers ─── */
const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `Added ${mins} min ago`;
    if (hours < 24) return `Added ${hours} hours ago`;
    if (days < 2) return 'Added yesterday';
    if (days < 7) return `Added ${days} days ago`;
    return `Updated ${days} days ago`;
};

/* ═══════════════════════════════════════════════ */
/*  RESOURCE CENTER PAGE                          */
/* ═══════════════════════════════════════════════ */
const ResourceCenterPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllFeatured, setShowAllFeatured] = useState(false);

    // Get eaglet's nest
    const { data: myNestsResponse } = useMyNests();
    const nestId = myNestsResponse?.data?.[0]?.id
        || myNestsResponse?.data?.results?.[0]?.id
        || user?.nest_id;

    // Fetch modules (published ones only — backend filters for eaglets)
    const { data: modulesResponse, isLoading } = useModules({ nest: nestId });
    const { data: progressResponse } = useMyProgress();

    const modules = modulesResponse?.data || modulesResponse?.results || [];
    const pData = progressResponse?.data || {};

    // Flatten all items from all modules for categorized display
    const allItems = useMemo(() => {
        const items = [];
        modules.forEach(mod => {
            const modItems = mod.items || [];
            if (modItems.length > 0) {
                modItems.forEach(item => items.push({ ...item, _module: mod }));
            } else {
                // Module with no items — show as a featured resource
                items.push({
                    id: mod.id,
                    title: mod.title,
                    description: mod.description,
                    content_type: mod.primary_type || 'reading',
                    created_at: mod.created_at,
                    _module: mod,
                    _isModule: true,
                });
            }
        });
        return items;
    }, [modules]);

    // Search filter
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return allItems;
        const q = searchQuery.toLowerCase();
        return allItems.filter(item =>
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item._module?.title?.toLowerCase().includes(q)
        );
    }, [allItems, searchQuery]);

    // Categorize items
    const featured = filteredItems.slice(0, showAllFeatured ? filteredItems.length : 3);
    const videos = filteredItems.filter(i => i.content_type === 'video');
    const documents = filteredItems.filter(i => i.content_type === 'document');
    const links = filteredItems.filter(i => i.content_type === 'reading');

    // Recent content (last 5, sorted by date)
    const recentContent = useMemo(() => {
        return [...filteredItems]
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            .slice(0, 5);
    }, [filteredItems]);

    const handleItemClick = (item) => {
        const moduleId = item._module?.id || item.id;
        if (item._isModule) {
            navigate(`/eaglet/assignments/${moduleId}`);
        } else if (item.content_type === 'reading' && item.file_url) {
            window.open(item.file_url, '_blank');
        } else {
            navigate(`/eaglet/assignments/${moduleId}/${item.id}`);
        }
    };

    // Icon for recent content
    const recentIcon = (type) => {
        if (type === 'video') return { icon: 'play_circle', bg: 'bg-primary/10', color: 'text-primary' };
        if (type === 'document') return { icon: 'description', bg: 'bg-emerald-50', color: 'text-emerald-600' };
        if (type === 'reading') return { icon: 'help', bg: 'bg-amber-50', color: 'text-amber-600' };
        return { icon: 'bolt', bg: 'bg-blue-50', color: 'text-blue-600' };
    };

    if (isLoading) {
        return (
            <DashboardLayout variant="eaglet">
                <div className="max-w-[1200px] mx-auto py-8 px-4">
                    <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse mb-8" />
                    <div className="h-24 bg-slate-50 rounded-2xl animate-pulse mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl h-72 animate-pulse" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="eaglet">
            <AnimatedBg />

            <div className="flex-1 w-full max-w-[1200px] mx-auto py-6 md:py-8 px-4">
                {/* ─── Page Header with Search ─── */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4 mb-6"
                >
                    <h1 className="text-2xl md:text-[28px] font-black text-slate-900 tracking-tight">
                        Resource Center
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-52 md:w-64 rounded-xl bg-white text-slate-700 text-sm placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm relative"
                        >
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                    </div>
                </motion.div>

                {/* ─── Welcome Banner ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/70 p-6 md:p-8 mb-8 shadow-sm"
                >
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                        Grow your knowledge
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                        Welcome to your central library. Here you'll find everything from starter guides to advanced mentorship techniques, tailored specifically for your journey.
                    </p>
                </motion.div>

                {/* ─── Main Content (two columns on large screens) ─── */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column — Main Content */}
                    <div className="flex-1 min-w-0 space-y-10">

                        {/* ═══ Featured Resources ═══ */}
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-slate-900">Featured Resources</h2>
                                {filteredItems.length > 3 && (
                                    <button
                                        onClick={() => setShowAllFeatured(!showAllFeatured)}
                                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        {showAllFeatured ? 'Show Less' : 'View All'}
                                    </button>
                                )}
                            </div>

                            {featured.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">library_books</span>
                                    <p className="text-sm font-bold text-slate-700 mb-1">No resources yet</p>
                                    <p className="text-xs text-slate-400">
                                        {searchQuery ? 'No resources match your search.' : 'Your mentor hasn\'t shared any content yet. Check back soon!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <AnimatePresence>
                                        {featured.map((item, i) => (
                                            <FeaturedCard
                                                key={item.id}
                                                item={item}
                                                module={item._module}
                                                delay={i}
                                                onClick={() => handleItemClick(item)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>

                        {/* ═══ Videos Section ═══ */}
                        {videos.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary">play_circle</span>
                                    Videos
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {videos.slice(0, 4).map((item, i) => (
                                        <CompactItem
                                            key={item.id}
                                            item={item}
                                            module={item._module}
                                            delay={i}
                                            onClick={() => handleItemClick(item)}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ Documents Section ═══ */}
                        {documents.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-emerald-600">description</span>
                                    Documents
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {documents.slice(0, 4).map((item, i) => (
                                        <CompactItem
                                            key={item.id}
                                            item={item}
                                            module={item._module}
                                            delay={i}
                                            onClick={() => handleItemClick(item)}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ Useful Links Section ═══ */}
                        {links.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-blue-600">link</span>
                                    Useful Links
                                </h2>
                                <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
                                    {links.slice(0, 5).map((item, i) => (
                                        <LinkItem
                                            key={item.id}
                                            item={item}
                                            delay={i}
                                            onClick={() => handleItemClick(item)}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* ─── Right Sidebar ─── */}
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                        {/* Recent Content Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm"
                        >
                            <h3 className="text-base font-black text-slate-900 mb-4">Recent Content</h3>
                            {recentContent.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No content yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentContent.map((item) => {
                                        const rc = recentIcon(item.content_type);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`w-10 h-10 rounded-xl ${rc.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <span className={`material-symbols-outlined ${rc.color} text-lg`}>{rc.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{timeAgo(item.created_at)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {filteredItems.length > 5 && (
                                <button
                                    onClick={() => setShowAllFeatured(true)}
                                    className="mt-4 w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                                >
                                    View All Activity
                                </button>
                            )}
                        </motion.div>

                        {/* Your Progress Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50 p-5"
                        >
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                                YOUR PROGRESS
                            </h3>
                            <ProgressBar
                                value={pData.completed || 0}
                                max={pData.total_items || filteredItems.length || 0}
                            />
                            <p className="text-xs text-slate-500 italic mt-4 leading-relaxed">
                                "Knowledge is the wing wherewith we fly to heaven."
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ResourceCenterPage;
