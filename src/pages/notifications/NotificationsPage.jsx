import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../../modules/notifications/hooks/useNotifications';
import { formatRelativeTime } from '../../shared/utils';

/* ─── Notification type metadata ─── */
const NOTIF_META = {
    mentorship_request: { icon: 'person_add', color: 'bg-blue-500', lightBg: 'bg-blue-50 text-blue-600', label: 'Mentorship' },
    mentorship_approved: { icon: 'check_circle', color: 'bg-emerald-500', lightBg: 'bg-emerald-50 text-emerald-600', label: 'Approved' },
    mentorship_rejected: { icon: 'cancel', color: 'bg-red-500', lightBg: 'bg-red-50 text-red-600', label: 'Declined' },
    content_published: { icon: 'library_books', color: 'bg-purple-500', lightBg: 'bg-purple-50 text-purple-600', label: 'Content' },
    points_awarded: { icon: 'stars', color: 'bg-amber-500', lightBg: 'bg-amber-50 text-amber-600', label: 'Points' },
    badge_earned: { icon: 'military_tech', color: 'bg-yellow-500', lightBg: 'bg-yellow-50 text-yellow-700', label: 'Badge' },
    nest_post: { icon: 'forum', color: 'bg-cyan-500', lightBg: 'bg-cyan-50 text-cyan-600', label: 'Nest' },
    assignment_graded: { icon: 'grading', color: 'bg-indigo-500', lightBg: 'bg-indigo-50 text-indigo-600', label: 'Assignment' },
    general: { icon: 'notifications', color: 'bg-slate-500', lightBg: 'bg-slate-100 text-slate-600', label: 'General' },
};

const FILTER_TABS = [
    { key: 'all', label: 'All', icon: 'inbox' },
    { key: 'unread', label: 'Unread', icon: 'mark_email_unread' },
    { key: 'mentorship', label: 'Mentorship', icon: 'people' },
    { key: 'content', label: 'Content', icon: 'school' },
    { key: 'points', label: 'Points & Badges', icon: 'stars' },
];

/* ─── Date grouping helper ─── */
const groupByDate = (items) => {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    items.forEach((item) => {
        const date = new Date(item.created_at);
        let label;
        if (date >= today) label = 'Today';
        else if (date >= yesterday) label = 'Yesterday';
        else if (date >= weekAgo) label = 'This Week';
        else label = 'Earlier';

        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
    });
    return groups;
};

/* ─── Single notification row ─── */
const NotificationRow = ({ notif, onRead, onNavigate, index }) => {
    const meta = NOTIF_META[notif.notification_type] || NOTIF_META.general;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            onClick={() => {
                if (!notif.is_read) onRead(notif.id);
                if (notif.action_url) onNavigate(notif.action_url);
            }}
            className={`
                group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200
                ${!notif.is_read
                    ? 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20'
                    : 'bg-white/60 hover:bg-white border border-transparent hover:border-slate-100'
                }
            `}
        >
            {/* Unread dot */}
            {!notif.is_read && (
                <div className="absolute top-4 left-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl ${meta.lightBg} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                <span className="material-symbols-outlined text-xl">{meta.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                    </p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${meta.lightBg}`}>
                        {meta.label}
                    </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{notif.message}</p>
            </div>

            {/* Time + Action */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
                <span className="text-xs text-slate-400">{formatRelativeTime(notif.created_at)}</span>
                {notif.action_url && (
                    <span className="material-symbols-outlined text-base text-slate-300 group-hover:text-primary transition-colors">
                        arrow_forward
                    </span>
                )}
            </div>
        </motion.div>
    );
};

/* ─── Main Page ─── */
const NotificationsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('all');

    const { data: notificationsData, isLoading } = useNotifications();
    const { data: unreadData } = useUnreadCount();
    const markAsReadMutation = useMarkAsRead();
    const markAllAsReadMutation = useMarkAllAsRead();

    const allNotifications = useMemo(
        () => notificationsData?.data || notificationsData?.results || [],
        [notificationsData]
    );
    const unreadCount = unreadData?.data?.count ?? unreadData?.data?.unread_count ?? 0;

    // Filter notifications
    const filtered = useMemo(() => {
        switch (activeTab) {
            case 'unread':
                return allNotifications.filter((n) => !n.is_read);
            case 'mentorship':
                return allNotifications.filter((n) =>
                    ['mentorship_request', 'mentorship_approved', 'mentorship_rejected'].includes(n.notification_type)
                );
            case 'content':
                return allNotifications.filter((n) =>
                    ['content_published', 'assignment_graded', 'nest_post'].includes(n.notification_type)
                );
            case 'points':
                return allNotifications.filter((n) =>
                    ['points_awarded', 'badge_earned'].includes(n.notification_type)
                );
            default:
                return allNotifications;
        }
    }, [allNotifications, activeTab]);

    const grouped = useMemo(() => groupByDate(filtered), [filtered]);
    const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    const variant = user?.role === 'eagle' ? 'eagle' : user?.role === 'admin' ? 'admin' : 'eaglet';

    return (
        <DashboardLayout variant={variant}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                            </div>
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-sm font-bold bg-primary text-white px-2.5 py-1 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 ml-[52px]">Stay updated on your mentorship journey</p>
                    </div>

                    {unreadCount > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => markAllAsReadMutation.mutate()}
                            disabled={markAllAsReadMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50 self-start sm:self-auto"
                        >
                            <span className="material-symbols-outlined text-lg">done_all</span>
                            Mark all as read
                        </motion.button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl mb-6 overflow-x-auto">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                                ${activeTab === tab.key
                                    ? 'bg-white shadow-sm text-primary'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1 text-[10px] bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 animate-pulse flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grouped Notifications */}
                {!isLoading && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            {groupOrder.map((groupLabel) => {
                                const items = grouped[groupLabel];
                                if (!items || items.length === 0) return null;

                                return (
                                    <div key={groupLabel}>
                                        <div className="flex items-center gap-3 mb-3 px-1">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{groupLabel}</h3>
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-xs text-slate-400">{items.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {items.map((notif, idx) => (
                                                <NotificationRow
                                                    key={notif.id}
                                                    notif={notif}
                                                    index={idx}
                                                    onRead={(id) => markAsReadMutation.mutate(id)}
                                                    onNavigate={(url) => navigate(url)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {filtered.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">
                                            {activeTab === 'unread' ? 'mark_email_read' : 'notifications_off'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        {activeTab === 'unread' ? 'All caught up!' : 'No notifications'}
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                        {activeTab === 'unread'
                                            ? 'You\'ve read all your notifications. Great job staying on top of things!'
                                            : 'When you receive notifications, they\'ll appear here grouped by date.'
                                        }
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NotificationsPage;
