import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useNestDetail, useNestMembers, useNestEvents } from '../../modules/nest/hooks/useNests';
import PostFeed from '../../modules/nest/components/PostFeed';

/* ─── Soft animated background ─── */
const AnimatedBg = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full animate-blob" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-400/15 blur-3xl rounded-full animate-blob animation-delay-4000" />
    </div>
);

const InitialsAvatar = ({ name, size = 'md', className = '' }) => {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    return (
        <div className={`${sizes[size]} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 ${className}`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
};

/* ─── Welcome Banner (green gradient, matching screenshot) ─── */
const WelcomeBanner = ({ nest }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 rounded-2xl p-6 border border-emerald-200/50 overflow-hidden"
    >
        {/* Decorative bird silhouette */}
        <div className="absolute right-6 bottom-2 opacity-10">
            <span className="material-symbols-outlined" style={{ fontSize: 80 }}>
                flutter_dash
            </span>
        </div>
        <div className="relative z-10">
            <h2 className="text-lg font-bold text-emerald-900 mb-1.5">
                Welcome to {nest?.name || 'the Nest'}!
            </h2>
            <p className="text-sm text-emerald-700/80 max-w-lg leading-relaxed">
                You're officially part of the flock. Start by introducing yourself to the community and letting everyone know what you hope to achieve here.
            </p>
        </div>
    </motion.div>
);


/* ─── Sidebar: About Card ─── */
const AboutCard = ({ nest }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            About {nest?.name || 'This Nest'}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
            {nest?.description || 'A mentorship community focused on growth and learning.'}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">group</span>
                {nest?.member_count || 0} Members
            </span>
            <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">{nest?.privacy === 'public' ? 'public' : 'lock'}</span>
                {nest?.privacy === 'public' ? 'Global' : 'Private'}
            </span>
        </div>
    </div>
);

/* ─── Sidebar: Upcoming Events ─── */
const EventsCard = ({ nestId }) => {
    const { data: eventsData } = useNestEvents(nestId);
    const events = eventsData?.data || [];
    if (!events.length) return null;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Upcoming Events</h3>
                <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <div className="space-y-3">
                {events.slice(0, 3).map((event, i) => {
                    const date = new Date(event.event_date);
                    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    const day = date.getDate();

                    return (
                        <div key={event.id || i} className="flex items-center gap-3">
                            {/* Date badge */}
                            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[9px] font-bold uppercase text-red-500 leading-none">{month}</span>
                                <span className="text-base font-bold text-red-600 leading-none">{day}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                                <p className="text-xs text-slate-400">
                                    {event.meeting_link ? '🔗 Zoom Link' : `@ ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Sidebar: Members Preview ─── */
const MembersPreview = ({ nestId, memberCount }) => {
    const { data: membersData } = useNestMembers(nestId);
    const members = membersData?.data || [];
    const displayMembers = members.slice(0, 8);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">group</span>
                    Members
                </h3>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {memberCount || members.length}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {displayMembers.map((m) => (
                    <div key={m.id} className="flex flex-col items-center gap-1 group cursor-pointer">
                        <InitialsAvatar name={m.user_details?.first_name} size="sm" className="group-hover:ring-2 ring-primary/20 transition-all" />
                        <span className="text-[10px] text-slate-500 truncate w-full text-center font-medium">
                            {m.user_details?.first_name}
                        </span>
                    </div>
                ))}
            </div>

            {members.length > 8 && (
                <button className="w-full text-center text-xs font-medium text-primary hover:underline mt-3 pt-3 border-t border-slate-100">
                    View all {memberCount} members
                </button>
            )}
        </div>
    );
};

/* ─── Main Page ─── */
const NestCommunityHubPage = () => {
    const { user } = useAuthStore();
    const { nestId } = useParams();
    const navigate = useNavigate();

    const { data: nestData, isLoading, isError } = useNestDetail(nestId);
    const { data: membersData, isLoading: membersLoading } = useNestMembers(nestId);

    const isEagle = user?.role === 'eagle';

    if (isLoading) {
        return (
            <DashboardLayout variant={isEagle ? 'eagle' : 'eaglet'}>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-400">Loading your nest...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (isError || !nestData?.data) {
        return <Navigate to={isEagle ? '/eagle/dashboard' : '/eaglet/nest'} replace />;
    }

    const nest = nestData.data;

    // H17: enforce membership — only the nest's eagle (owner) or confirmed members may view
    // API returns eagle as nested object under eagle_details (NestDetailSerializer)
    if (!membersLoading) {
        const isOwner = nest.eagle_details?.id === user?.id;
        const isMember = membersData?.data?.some(
            (m) => m.user_details?.id === user?.id || m.user === user?.id
        );
        if (!isOwner && !isMember) {
            return <Navigate to={isEagle ? '/eagle/dashboard' : '/eaglet/nest'} replace />;
        }
    }

    return (
        <DashboardLayout variant={isEagle ? 'eagle' : 'eaglet'}>
            <AnimatedBg />

            <div className="flex-1 w-full max-w-[1440px] mx-auto py-6 md:py-8">
                {/* ─── Page Header ─── */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">diversity_3</span>
                        <h1 className="text-xl font-bold text-slate-900">{nest?.name} Feed</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search nest..."
                                className="pl-10 pr-4 py-2 w-44 rounded-xl bg-white text-slate-700 text-sm placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
                            />
                        </div>

                        {/* Eagle actions */}
                        {isEagle && (
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(`/eagle/nests/${nestId}/requests`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-primary/30 hover:text-primary transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-base">inbox</span>
                                    Requests
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(`/eagle/nests/${nestId}/settings`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-primary/30 hover:text-primary transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-base">settings</span>
                                    Settings
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ─── Two-Column Layout ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Feed (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                        {/* Welcome Banner */}
                        <WelcomeBanner nest={nest} />

                        {/* Post Feed */}
                        <PostFeed nestId={nestId} />
                    </div>

                    {/* Right: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                        <AboutCard nest={nest} />
                        <EventsCard nestId={nest.id} />
                        <MembersPreview nestId={nest.id} memberCount={nest.member_count} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NestCommunityHubPage;
