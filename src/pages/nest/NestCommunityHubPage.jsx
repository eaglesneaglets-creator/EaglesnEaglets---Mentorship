import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useNestDetail, useNestMembers, useNestPosts, useCreatePost, useNestEvents } from '../../modules/nest/hooks/useNests';

/* ─── Soft animated background ─── */
const AnimatedBg = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full animate-blob" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-400/15 blur-3xl rounded-full animate-blob animation-delay-4000" />
    </div>
);

/* ─── Helpers ─── */
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

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

/* ─── Post Composer ─── */
const PostComposer = ({ nestId, user }) => {
    const [content, setContent] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const createMutation = useCreatePost(nestId);

    const handlePost = () => {
        if (!content.trim()) return;
        createMutation.mutate(
            { content, post_type: 'post' },
            { onSuccess: () => { setContent(''); setIsFocused(false); } }
        );
    };

    return (
        <motion.div
            layout
            className={`bg-white rounded-2xl shadow-sm border transition-all ${
                isFocused ? 'border-primary/30 shadow-primary/5' : 'border-slate-200/70'
            }`}
        >
            <div className="p-4">
                <div className="flex gap-3">
                    <InitialsAvatar name={user?.first_name} />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => !content && setIsFocused(false)}
                            rows={isFocused ? 3 : 1}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 transition-all"
                            placeholder="Introduce yourself to your new nest..."
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 flex justify-between items-center border-t border-slate-100 pt-3">
                            <div className="flex gap-1">
                                {[
                                    { icon: 'image', color: 'text-blue-500' },
                                    { icon: 'attach_file', color: 'text-slate-500' },
                                    { icon: 'mood', color: 'text-amber-500' },
                                ].map((btn) => (
                                    <button
                                        key={btn.icon}
                                        className={`w-9 h-9 flex items-center justify-center ${btn.color} hover:bg-slate-100 rounded-lg transition-colors`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{btn.icon}</span>
                                    </button>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handlePost}
                                disabled={!content.trim() || createMutation.isPending}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                            >
                                Post
                                <span className="material-symbols-outlined text-lg">send</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* ─── Post Card ─── */
const PostCard = ({ post, index }) => {
    const [liked, setLiked] = useState(false);

    const isPinned = post.is_pinned;
    const isEagle = post.author_details?.role === 'eagle';
    const authorName = `${post.author_details?.first_name || ''} ${post.author_details?.last_name || ''}`.trim() || 'Anonymous';

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow"
        >
            {/* Author row */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                    <InitialsAvatar name={post.author_details?.first_name} />
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{authorName}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isEagle
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-emerald-50 text-emerald-600'
                            }`}>
                                {isEagle ? 'Mentor' : 'Mentee'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(post.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-400">
                            <span className="material-symbols-outlined text-sm">push_pin</span>
                            Pinned
                        </span>
                    )}
                    <button className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {post.content}
            </div>

            {/* Attachment */}
            {post.attachment_url && (
                <a
                    href={post.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-4 hover:bg-emerald-100/60 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-900 truncate">
                            {post.attachment_name || 'Attachment'}
                        </p>
                        <p className="text-xs text-emerald-600/60">
                            {post.attachment_size || 'Click to view'}{post.attachment_label ? ` · ${post.attachment_label}` : ''}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-400 group-hover:text-emerald-600 transition-colors">download</span>
                </a>
            )}

            {/* Interactions */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                        liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                    </span>
                    <span>{(post.likes_count || 0) + (liked ? 1 : 0)}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-all">
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    <span>{post.comments_count || 0} Comments</span>
                </button>
            </div>
        </motion.article>
    );
};

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
    const { data: postsData, isLoading: postsLoading } = useNestPosts(nestId);
    const posts = postsData?.data || [];

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

                        {/* Post Composer */}
                        <PostComposer nestId={nest.id} user={user} />

                        {/* Post Feed */}
                        {postsLoading && (
                            <div className="text-center py-8 text-slate-400 text-sm">Loading posts...</div>
                        )}

                        {posts.map((post, i) => (
                            <PostCard key={post.id} post={post} index={i} />
                        ))}

                        {posts.length === 0 && !postsLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 bg-white/60 rounded-2xl border-2 border-dashed border-slate-200"
                            >
                                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">forum</span>
                                <p className="text-slate-500 font-medium mb-1">No posts yet</p>
                                <p className="text-slate-400 text-sm">Be the first to share something with the nest!</p>
                            </motion.div>
                        )}
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
