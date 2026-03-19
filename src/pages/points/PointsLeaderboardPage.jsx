import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useMyPoints, useLeaderboard, useMyBadges } from '../../modules/points/hooks/usePoints';
import BadgeGrid from '../../modules/points/components/BadgeGrid';

const FILTER_PARAMS = {
    'All Time': { period: 'all' },
    'This Month': { period: 'month' },
    'My Nest': { scope: 'nest' },
};

/* ─── Stats Card ─── */
const StatCard = ({ icon, label, value, accent, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
    >
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </motion.div>
);

/* ─── Podium Spot ─── */
const PodiumSpot = ({ entry, rank, isCurrentUser }) => {
    const config = {
        1: {
            height: 'h-32',
            size: 'w-20 h-20',
            ring: 'ring-4 ring-yellow-400',
            medal: '🥇',
            medalBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
            order: 'order-2',
            nameSize: 'text-base',
            pointsSize: 'text-lg',
            delay: 0.2,
        },
        2: {
            height: 'h-24',
            size: 'w-16 h-16',
            ring: 'ring-4 ring-slate-300',
            medal: '🥈',
            medalBg: 'bg-gradient-to-br from-slate-300 to-slate-400',
            order: 'order-1',
            nameSize: 'text-sm',
            pointsSize: 'text-base',
            delay: 0.3,
        },
        3: {
            height: 'h-20',
            size: 'w-16 h-16',
            ring: 'ring-4 ring-amber-600/50',
            medal: '🥉',
            medalBg: 'bg-gradient-to-br from-amber-600 to-amber-700',
            order: 'order-3',
            nameSize: 'text-sm',
            pointsSize: 'text-base',
            delay: 0.4,
        },
    };

    const c = config[rank];
    if (!entry) return <div className={`flex-1 ${c.order}`} />;

    const initials = `${entry.first_name?.charAt(0) || ''}${entry.last_name?.charAt(0) || ''}`.toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: c.delay, type: 'spring' }}
            className={`flex-1 flex flex-col items-center ${c.order}`}
        >
            {/* Avatar */}
            <div className="relative mb-2">
                <div className={`${c.size} rounded-full ${c.ring} bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-bold text-lg shadow-lg ${isCurrentUser ? 'ring-primary' : ''}`}>
                    {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 text-xl">{c.medal}</div>
            </div>

            {/* Name */}
            <p className={`${c.nameSize} font-bold text-slate-900 text-center leading-tight mb-0.5 ${isCurrentUser ? 'text-primary' : ''}`}>
                {isCurrentUser ? 'You' : entry.first_name}
            </p>
            <p className={`${c.pointsSize} font-black text-primary`}>
                {entry.total_points?.toLocaleString()}
            </p>

            {/* Podium bar */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ duration: 0.6, delay: c.delay + 0.2 }}
                className={`w-full ${c.height} mt-2 rounded-t-2xl ${rank === 1 ? 'bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 border border-yellow-200' : rank === 2 ? 'bg-gradient-to-t from-slate-200/50 to-slate-100/20 border border-slate-200' : 'bg-gradient-to-t from-amber-200/30 to-amber-100/10 border border-amber-200/50'}`}
            />
        </motion.div>
    );
};

/* ─── Rankings Table Row ─── */
const RankRow = ({ entry, rank, isCurrentUser, index }) => (
    <motion.tr
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className={`
            group transition-colors
            ${isCurrentUser
                ? 'bg-primary/5 border-l-4 border-l-primary'
                : 'hover:bg-slate-50 border-l-4 border-l-transparent'
            }
        `}
    >
        <td className="py-3 px-4 text-center">
            <span className={`text-sm font-bold ${rank <= 3 ? 'text-primary' : 'text-slate-400'}`}>
                {rank}
            </span>
        </td>
        <td className="py-3 px-4">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${isCurrentUser ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {entry.first_name?.charAt(0)}
                </div>
                <div>
                    <p className={`text-sm font-semibold ${isCurrentUser ? 'text-primary' : 'text-slate-900'}`}>
                        {isCurrentUser ? 'You' : `${entry.first_name} ${entry.last_name}`}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{entry.role === 'eagle' ? 'Mentor' : 'Mentee'}</p>
                </div>
            </div>
        </td>
        <td className="py-3 px-4 text-right">
            <span className={`text-sm font-bold ${isCurrentUser ? 'text-primary' : 'text-slate-900'}`}>
                {entry.total_points?.toLocaleString()}
            </span>
        </td>
    </motion.tr>
);

/* ─── Main Page ─── */
const PointsLeaderboardPage = () => {
    const { user } = useAuthStore();
    const [activeFilter, setActiveFilter] = useState('All Time');

    const leaderboardParams = useMemo(() => FILTER_PARAMS[activeFilter], [activeFilter]);

    const { data: myPointsData, isLoading: myPointsLoading } = useMyPoints();
    const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard(leaderboardParams);
    const { data: myBadgesData, isLoading: myBadgesLoading } = useMyBadges();

    const myPoints = myPointsData?.data?.total_points || 0;
    const myRank = myPointsData?.data?.rank || 0;
    const badgesEarned = myPointsData?.data?.badge_count || 0;
    const streakDays = myPointsData?.data?.streak_days || 0;

    const entries = leaderboardData?.data || [];
    const top3 = entries.slice(0, 3);

    const badges = myBadgesData?.data || [];

    const variant = user?.role === 'eagle' ? 'eagle' : user?.role === 'admin' ? 'admin' : 'eaglet';

    return (
        <DashboardLayout variant={variant}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <span className="material-symbols-outlined text-white text-2xl">emoji_events</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leaderboard</h1>
                                <p className="text-sm text-slate-500">Compete, earn points, and rise through the ranks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    <StatCard
                        icon="stars"
                        label="Your Points"
                        value={myPointsLoading ? '...' : myPoints.toLocaleString()}
                        accent="bg-amber-50 text-amber-600"
                        delay={0}
                    />
                    <StatCard
                        icon="leaderboard"
                        label="Your Rank"
                        value={myPointsLoading ? '...' : myRank ? `#${myRank}` : '—'}
                        accent="bg-blue-50 text-blue-600"
                        delay={0.05}
                    />
                    <StatCard
                        icon="military_tech"
                        label="Badges"
                        value={myPointsLoading ? '...' : badgesEarned}
                        accent="bg-purple-50 text-purple-600"
                        delay={0.1}
                    />
                    <StatCard
                        icon="local_fire_department"
                        label="Streak"
                        value={myPointsLoading ? '...' : `${streakDays}d`}
                        accent="bg-orange-50 text-orange-600"
                        delay={0.15}
                    />
                </div>

                {/* Podium Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-6 pb-0 mb-8 overflow-hidden"
                >
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Top Champions</h2>
                        <p className="text-xs text-slate-400">Leading the mentorship journey</p>
                    </div>

                    {leaderboardLoading ? (
                        <div className="text-center py-16 text-slate-400">Loading champions...</div>
                    ) : top3.length > 0 ? (
                        <div className="flex items-end justify-center gap-4 max-w-md mx-auto px-4">
                            <PodiumSpot entry={top3[1]} rank={2} isCurrentUser={top3[1]?.user.id === user?.id} />
                            <PodiumSpot entry={top3[0]} rank={1} isCurrentUser={top3[0]?.user.id === user?.id} />
                            <PodiumSpot entry={top3[2]} rank={3} isCurrentUser={top3[2]?.user.id === user?.id} />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">emoji_events</span>
                            <p className="text-sm text-slate-400">No leaderboard data yet</p>
                        </div>
                    )}
                </motion.div>

                {/* Filter Tabs + Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Rankings</h3>
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                            {Object.keys(FILTER_PARAMS).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`
                                        px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200
                                        ${activeFilter === filter
                                            ? 'bg-white shadow-sm text-primary'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }
                                    `}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    {leaderboardLoading ? (
                        <div className="p-8 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-8 h-4 bg-slate-100 rounded" />
                                    <div className="w-9 h-9 rounded-full bg-slate-100" />
                                    <div className="flex-1 h-4 bg-slate-100 rounded" />
                                    <div className="w-16 h-4 bg-slate-100 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : entries.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                                    <th className="py-2.5 px-4 text-center w-16">#</th>
                                    <th className="py-2.5 px-4 text-left">User</th>
                                    <th className="py-2.5 px-4 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {/* Show all entries (top 3 are already in podium but still in table) */}
                                {entries.map((entry, index) => (
                                    <RankRow
                                        key={entry.user.id}
                                        entry={entry}
                                        rank={index + 1}
                                        isCurrentUser={entry.user.id === user?.id}
                                        index={index}
                                    />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-3xl text-slate-300">leaderboard</span>
                            <p className="text-sm text-slate-400 mt-2">No rankings available yet. Start earning points!</p>
                        </div>
                    )}
                </div>

                {/* Badges Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <BadgeGrid badges={badges} isLoading={myBadgesLoading} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PointsLeaderboardPage;
