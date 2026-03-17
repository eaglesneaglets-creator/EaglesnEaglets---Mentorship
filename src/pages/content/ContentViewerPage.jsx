import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useModuleDetail, useModuleItems, useUpdateProgress } from '../../modules/content/hooks/useContent';
import toast from 'react-hot-toast';
import DocumentViewer from '../../shared/components/visual/DocumentViewer';

const TYPE_CONFIG = {
    video: { icon: 'play_circle', color: 'emerald', label: 'Video' },
    document: { icon: 'description', color: 'emerald', label: 'Document' },
    reading: { icon: 'menu_book', color: 'emerald', label: 'Reading' },
    quiz: { icon: 'quiz', color: 'emerald', label: 'Quiz' },
};


const ContentViewerPage = () => {
    const { moduleId } = useParams();
    const { user } = useAuthStore();

    const videoRef = useRef(null);
    const { mutate: updateProgress } = useUpdateProgress();

    const [activeItemId, setActiveItemId] = useState(null);
    const [sidebarOpen] = useState(true);
    const [, setProgressPercentage] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [completedItems, setCompletedItems] = useState(new Set());

    const { data: moduleResponse, isLoading: moduleLoading } = useModuleDetail(moduleId);
    const { data: itemsResponse, isLoading: itemsLoading } = useModuleItems(moduleId);

    const moduleData = moduleResponse?.data || moduleResponse || {};
    const items = useMemo(() => itemsResponse?.data?.data || itemsResponse?.data || [], [itemsResponse]);

    const effectiveItemId = activeItemId ?? items[0]?.id ?? null;

    const activeItem = items.find(i => i.id === effectiveItemId) || null;
    const activeIndex = items.findIndex(i => i.id === effectiveItemId);
    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < items.length - 1;

    // Progress sync (throttled)
    const syncProgressToServer = useCallback(
        (percent, duration, force = false) => {
            const now = Date.now();
            if (force || now - lastSyncTime > 5000) {
                if (activeItem?.id) {
                    updateProgress(
                        {
                            itemId: activeItem.id,
                            data: {
                                progress_percentage: percent,
                                watch_duration_seconds: duration,
                            },
                        },
                        {
                            onSuccess: () => {
                                if (force && percent >= 100) {
                                    setCompletedItems(prev => new Set([...prev, activeItem.id]));
                                }
                            }
                        }
                    );
                    setLastSyncTime(now);
                }
            }
        },
        [activeItem, updateProgress, lastSyncTime]
    );

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        if (video.duration) {
            const currentProgress = (video.currentTime / video.duration) * 100;
            setProgressPercentage(currentProgress);
            syncProgressToServer(currentProgress, Math.floor(video.currentTime));
        }
    };

    const handleVideoEnded = () => {
        setProgressPercentage(100);
        syncProgressToServer(100, Math.floor(videoRef.current?.duration || 0), true);
        toast.success("Lesson completed!", { icon: '✅' });
    };

    const handleMarkComplete = () => {
        setIsSaving(true);
        setProgressPercentage(100);
        syncProgressToServer(100, 0, true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Activity marked as complete!");
        }, 800);
    };

    // Reset progress when switching items
    const [prevEffectiveItemId, setPrevEffectiveItemId] = useState(effectiveItemId);
    if (prevEffectiveItemId !== effectiveItemId) {
        setPrevEffectiveItemId(effectiveItemId);
        setProgressPercentage(0);
        setLastSyncTime(0);
        setIsSaving(false);
    }

    // Cleanup scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const goToItem = (direction) => {
        const nextIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
        if (nextIndex >= 0 && nextIndex < items.length) {
            setActiveItemId(items[nextIndex].id);
        }
    };

    const isLoading = moduleLoading || itemsLoading;
    const isCompleted = (itemId) => completedItems.has(itemId);
    const overallProgress = Math.round((completedItems.size / Math.max(items.length, 1)) * 100);

    return (
        <DashboardLayout
            variant={user?.role === 'eagle' ? 'eagle' : 'eaglet'}
            hideHeader
            fullWidth
            noPadding
        >
            <div className="flex flex-col h-screen overflow-hidden bg-white">


                {/* 1. Header Area: LMS Style */}
                <header className="shrink-0 h-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 z-30 px-6">

                    <div className="h-full max-w-[2000px] mx-auto flex items-center justify-between gap-8">
                        {/* Title Info */}
                        <div className="flex items-center gap-4 min-w-0">
                            <Link
                                to={user?.role === 'eagle' ? '/eagle/content' : '/eaglet/assignments'}
                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 border border-slate-100"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-lg font-black text-slate-900 truncate tracking-tight">

                                    {moduleData.title || 'Loading Module...'}
                                </h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {moduleData.nest_name || 'Personal Growth'} · Chapter {activeIndex + 1}
                                </p>

                            </div>
                        </div>

                        {/* Global Progress */}
                        <div className="hidden md:flex flex-1 max-w-md items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5 px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Progress</span>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">{overallProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallProgress}%` }}
                                        className="h-full bg-emerald-500 rounded-full"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors border border-slate-100">
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors border border-slate-100">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                        </div>

                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* 2. Main content area */}
                    <main className="flex-1 flex flex-col relative overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                            <div className="max-w-[1200px] mx-auto h-full flex flex-col">

                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="flex-1 flex flex-col items-center justify-center"
                                        >
                                            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Content...</p>
                                        </motion.div>
                                    ) : activeItem ? (
                                        <motion.div
                                            key={activeItem.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex-1 flex flex-col"
                                        >
                                            {/* Viewer Container */}
                                            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-50 shadow-2xl shadow-emerald-500/5 mb-10 border border-slate-200">

                                                {activeItem.content_type === 'video' ? (
                                                    <video
                                                        ref={videoRef}
                                                        key={activeItem.id}
                                                        src={activeItem.file_url}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                        onTimeUpdate={handleTimeUpdate}
                                                        onEnded={handleVideoEnded}
                                                        controlsList="nodownload"
                                                        playsInline
                                                    />
                                                ) : (
                                                    <DocumentViewer
                                                        url={activeItem.file_url}
                                                        type={activeItem.content_type}
                                                        title={activeItem.title}
                                                    />
                                                )}
                                            </div>

                                            {/* Lesson Description */}
                                            <div className="mb-12">
                                                <div className="flex items-center justify-between gap-6 mb-6">
                                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                                        {activeItem.title}
                                                    </h2>
                                                    <button className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                                                        <span className="material-symbols-outlined text-[20px]">download</span>
                                                        Resources
                                                    </button>
                                                </div>
                                                <p className="text-xl text-slate-500 leading-relaxed max-w-4xl">

                                                    {moduleData.description || "Master the concepts of this lesson through a combination of guided materials and practical exercises."}
                                                </p>
                                            </div>

                                            {/* Instructor Info */}
                                            <div className="flex items-center gap-12 py-10 border-t border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm border border-emerald-100">
                                                        {moduleData.created_by?.full_name?.charAt(0) || 'E'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Instructor</p>
                                                        <p className="text-base font-bold text-slate-900 leading-none">{moduleData.created_by?.full_name || 'Elite Mentor'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Difficulty</p>
                                                    <p className="text-base font-bold text-emerald-600 leading-none capitalize">{moduleData.difficulty || 'Advanced'}</p>
                                                </div>
                                            </div>

                                        </motion.div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                <span className="material-symbols-outlined text-4xl text-slate-300">auto_stories</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">No content selected</h3>
                                            <p className="text-slate-500 font-medium">Pick a lesson from the sidebar to begin.</p>
                                        </div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>

                        {/* 3. Sticky Footer Navigation */}
                        <footer className="shrink-0 h-24 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-30 px-8">
                            <div className="h-full max-w-[2000px] mx-auto flex items-center justify-between">
                                <button
                                    onClick={() => goToItem('prev')}
                                    disabled={!hasPrev}
                                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-bold transition-all hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    <span className="hidden sm:inline">Previous</span>
                                </button>


                                <button
                                    onClick={handleMarkComplete}
                                    disabled={isSaving || isCompleted(effectiveItemId)}
                                    className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black transition-all shadow-xl ${isCompleted(effectiveItemId)
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none'
                                        : isSaving
                                            ? 'bg-slate-100 text-slate-400 cursor-wait'
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >

                                    {isCompleted(effectiveItemId) ? (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Mark as Complete
                                        </>
                                    ) : isSaving ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Mark as Complete
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => goToItem('next')}
                                    disabled={!hasNext}
                                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 shadow-xl shadow-slate-900/20"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>

                            </div>
                        </footer>
                    </main>

                    {/* 4. Right Sidebar: Course Content */}
                    <aside className={`shrink-0 border-l border-slate-200 bg-slate-50/30 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-[400px]' : 'w-0'}`}>
                        <div className="shrink-0 p-6 flex items-center justify-between border-b border-slate-200 bg-white">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-500">list_alt</span>
                                <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Course Content</h3>
                            </div>
                        </div>


                        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                            {moduleLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="px-6 py-4 animate-pulse">
                                        <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-1">
                                    {items.map((group, gIdx) => (
                                        <div key={gIdx} className="border-b border-slate-100 last:border-0">
                                            <div className="px-6 py-4 bg-white flex items-center justify-between cursor-pointer group">
                                                <h4 className="font-black text-[11px] text-emerald-600 uppercase tracking-widest">
                                                    Module {gIdx + 1}: {group.title?.split(' ')[0] || 'Content'}
                                                </h4>
                                                <span className="material-symbols-outlined text-lg text-slate-300 group-hover:text-emerald-500 transition-colors">keyboard_arrow_down</span>
                                            </div>


                                            {/* Sub-item matching your reference (2.1, 2.2, etc) */}
                                            <button
                                                onClick={() => setActiveItemId(group.id)}
                                                className={`w-full text-left px-6 py-6 flex items-center gap-5 transition-all relative ${effectiveItemId === group.id
                                                    ? 'bg-emerald-50/50'
                                                    : 'hover:bg-slate-50'
                                                    }`}
                                            >

                                                {/* Active Indicator Bar */}
                                                {effectiveItemId === group.id && (
                                                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                                )}

                                                <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isCompleted(group.id)
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : effectiveItemId === group.id
                                                        ? 'bg-slate-900 text-white shadow-lg'
                                                        : 'bg-slate-100 text-slate-400'
                                                    }`}>

                                                    {isCompleted(group.id) ? (
                                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                                    ) : effectiveItemId === group.id ? (
                                                        <span className="material-symbols-outlined text-[20px] animate-pulse">play_arrow</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {TYPE_CONFIG[group.content_type]?.icon || 'description'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${effectiveItemId === group.id ? 'text-slate-900' : 'text-slate-600'
                                                        }`}>

                                                        {gIdx + 1}.{1} {group.title}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">{TYPE_CONFIG[group.content_type]?.icon}</span>
                                                            {TYPE_CONFIG[group.content_type]?.label}
                                                        </span>
                                                        {group.duration_minutes > 0 && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{group.duration_minutes}m</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {!isCompleted(group.id) && group.is_required && (
                                                    <span className="material-symbols-outlined text-[18px] text-slate-300">lock</span>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ContentViewerPage;
