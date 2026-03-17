import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAllBadges } from '../../modules/points/hooks/usePoints';

const CATEGORY_META = {
    courses_completed:       { label: 'Learning Journey',   colour: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-200' },
    assignments_submitted:   { label: 'Assignment Mastery', colour: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-200' },
    streak_days:             { label: 'Consistency',        colour: 'text-sky-600',     bg: 'bg-sky-50',      ring: 'ring-sky-200' },
    points_threshold:        { label: 'Points',             colour: 'text-violet-600',  bg: 'bg-violet-50',   ring: 'ring-violet-200' },
    community_contributions: { label: 'Community Voice',    colour: 'text-rose-600',    bg: 'bg-rose-50',     ring: 'ring-rose-200' },
    quizzes_passed:          { label: 'Quiz Sharpness',     colour: 'text-cyan-600',    bg: 'bg-cyan-50',     ring: 'ring-cyan-200' },
    events_attended:         { label: 'Nest Presence',      colour: 'text-orange-600',  bg: 'bg-orange-50',   ring: 'ring-orange-200' },
    one_time_event:          { label: 'Special',            colour: 'text-yellow-600',  bg: 'bg-yellow-50',   ring: 'ring-yellow-200' },
    nests_joined:            { label: 'Special',            colour: 'text-yellow-600',  bg: 'bg-yellow-50',   ring: 'ring-yellow-200' },
    competitive:             { label: 'Elite',              colour: 'text-yellow-400',  bg: 'bg-indigo-950',  ring: 'ring-yellow-400' },
};

const FILTER_TABS = [
    { key: 'all',                     label: 'All' },
    { key: 'earned',                  label: 'Earned' },
    { key: 'locked',                  label: 'Locked' },
    { key: 'courses_completed',       label: 'Learning' },
    { key: 'assignments_submitted',   label: 'Assignments' },
    { key: 'streak_days',             label: 'Streak' },
    { key: 'points_threshold',        label: 'Points' },
    { key: 'community_contributions', label: 'Community' },
    { key: 'quizzes_passed',          label: 'Quizzes' },
    { key: 'events_attended',         label: 'Events' },
    { key: 'one_time_event',          label: 'Special' },
    { key: 'competitive',             label: 'Elite' },
];

/* --- Badge Detail Modal --- */
const BadgeModal = ({ badge, onClose }) => {
    if (!badge) return null;
    const meta = CATEGORY_META[badge.criteria_type] || CATEGORY_META.one_time_event;
    const progressPct = badge.criteria_value > 0
        ? Math.min(100, Math.round((badge.progress / badge.criteria_value) * 100))
        : 100;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
                <div className={`w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center overflow-hidden ${!badge.earned ? 'grayscale opacity-40' : ''}`}>
                    <img src={badge.icon} alt={badge.name} className="w-full h-full" />
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${meta.bg} ${meta.colour}`}>
                    {meta.label}
                    {badge.criteria_type === 'competitive' && (
                        <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    )}
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-1">{badge.name}</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{badge.description}</p>

                {badge.earned ? (
                    <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-center gap-2 text-emerald-700 text-sm font-semibold">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                ) : badge.criteria_type !== 'competitive' && badge.criteria_type !== 'one_time_event' && badge.criteria_type !== 'nests_joined' ? (
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span>Progress</span>
                            <span className="font-bold">{badge.progress} / {badge.criteria_value}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{progressPct}% complete</p>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic">Complete the special activity to unlock</p>
                )}

                <button
                    onClick={onClose}
                    className="mt-5 w-full py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
};

/* --- Badge Card --- */
const BadgeCard = ({ badge, onClick }) => {
    const meta = CATEGORY_META[badge.criteria_type] || CATEGORY_META.one_time_event;

    return (
        <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick(badge)}
            className={`relative flex flex-col items-center p-4 rounded-2xl border transition-colors text-left w-full
                ${badge.earned
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
        >
            {badge.earned && (
                <span className="absolute top-2 right-2 material-symbols-outlined text-emerald-500 text-base">
                    verified
                </span>
            )}
            <div className={`w-14 h-14 rounded-xl mb-3 flex items-center justify-center overflow-hidden
                ${!badge.earned ? 'grayscale opacity-40' : ''}`}>
                <img src={badge.icon} alt={badge.name} className="w-full h-full" />
            </div>
            <p className="text-xs font-semibold text-slate-700 text-center leading-tight">{badge.name}</p>
            <span className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.colour}`}>
                {meta.label}
            </span>
        </motion.button>
    );
};

/* --- Main Page --- */
export default function BadgesPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedBadge, setSelectedBadge] = useState(null);
    const { data, isLoading, isError } = useAllBadges();

    const badges = useMemo(() => data?.data ?? [], [data]);
    const earnedCount = badges.filter(b => b.earned).length;

    const filtered = useMemo(() => {
        switch (activeTab) {
            case 'earned': return badges.filter(b => b.earned);
            case 'locked': return badges.filter(b => !b.earned);
            default: return badges.filter(b =>
                activeTab === 'all' || b.criteria_type === activeTab
            );
        }
    }, [badges, activeTab]);

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Badges</h1>
                    <p className="text-slate-500 mt-1">
                        {isLoading ? 'Loading...' : `${earnedCount} of ${badges.length} earned`}
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                                ${activeTab === tab.key
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {isError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">error_outline</span>
                        <p className="text-slate-500 font-medium">Could not load badges</p>
                        <p className="text-sm text-slate-400">Please check your connection and try again.</p>
                    </div>
                ) : isLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                    >
                        <AnimatePresence mode="popLayout">
                            {filtered.map(badge => (
                                <motion.div
                                    key={badge.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <BadgeCard badge={badge} onClick={setSelectedBadge} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
