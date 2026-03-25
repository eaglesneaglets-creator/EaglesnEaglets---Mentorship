import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useNestDetail, useNestRequests, useRespondToRequest } from '../../modules/nest/hooks/useNests';

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

const FILTER_TABS = [
    { key: 'pending', label: 'Pending', icon: 'schedule' },
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Approved', icon: 'check_circle' },
    { key: 'declined', label: 'Declined', icon: 'cancel' },
];

const STATUS_BADGE = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
    declined: { bg: 'bg-red-50', text: 'text-red-600', label: 'Declined' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Declined' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const RequestCard = ({ request, onRespond, isResponding }) => {
    const user = request.user_details || request.user || request.eaglet || {};
    const name = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username || 'Applicant';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const status = request.status?.toLowerCase() || 'pending';
    const isPending = status === 'pending';
    const badge = STATUS_BADGE[status] || STATUS_BADGE.pending;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200/70 p-5 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-0.5 transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                {user.profile_picture ? (
                    <img src={user.profile_picture} alt={name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initials}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{name}</h3>
                            {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-400">{formatDate(request.created_at)}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
                                {badge.label}
                            </span>
                        </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{request.message}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {isPending && (
                        <div className="flex items-center gap-2 mt-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onRespond(request.id, 'approve')}
                                disabled={isResponding}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">check</span>
                                Approve
                            </motion.button>
                            <button
                                onClick={() => onRespond(request.id, 'decline')}
                                disabled={isResponding}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Decline
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const MentorshipRequestsPage = () => {
    const { nestId } = useParams();
    const { data: nestResponse } = useNestDetail(nestId);
    const { data: requestsResponse, isLoading, isError } = useNestRequests(nestId);
    const respondMutation = useRespondToRequest(nestId);

    const [activeFilter, setActiveFilter] = useState('pending');
    const [respondingId, setRespondingId] = useState(null);

    const nest = nestResponse?.data || nestResponse || {};
    const requests = requestsResponse?.data || requestsResponse?.results || requestsResponse || [];

    const filtered = activeFilter === 'all'
        ? requests
        : requests.filter(r => {
            const s = r.status?.toLowerCase();
            if (activeFilter === 'approved') return s === 'approved' || s === 'accepted';
            if (activeFilter === 'declined') return s === 'declined' || s === 'rejected';
            return s === activeFilter;
        });

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status?.toLowerCase() === 'pending').length,
        approved: requests.filter(r => ['approved', 'accepted'].includes(r.status?.toLowerCase())).length,
        declined: requests.filter(r => ['declined', 'rejected'].includes(r.status?.toLowerCase())).length,
    };

    const handleRespond = async (requestId, action) => {
        setRespondingId(requestId);
        try {
            await respondMutation.mutateAsync({ requestId, status: action });
        } catch {
            // handled by React Query
        } finally {
            setRespondingId(null);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout variant="eagle">
                <div className="max-w-4xl mx-auto py-8 space-y-6">
                    <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-50 animate-pulse" />
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="eagle">
            <AnimatedBg />

            <div className="max-w-4xl mx-auto py-6 md:py-8 px-4 space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/eagle/nests/${nestId}`}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Mentorship Requests</h1>
                            <p className="text-sm text-slate-400 mt-0.5">{nest.name || 'Your Nest'}</p>
                        </div>
                    </div>

                    {counts.pending > 0 && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-sm font-semibold">{counts.pending} pending request{counts.pending !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden"
                >
                    {/* Tab bar */}
                    <div className="flex border-b border-slate-100 px-2">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`relative flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold transition-all ${
                                    activeFilter === tab.key
                                        ? 'text-primary'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab.icon && <span className="material-symbols-outlined text-base">{tab.icon}</span>}
                                {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                        activeFilter === tab.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {counts[tab.key]}
                                    </span>
                                )}
                                {activeFilter === tab.key && (
                                    <motion.div
                                        layoutId="requestsActiveTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Request list */}
                    <div className="p-5">
                        {isError ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-4xl text-red-300 block mb-3">error</span>
                                <p className="text-sm font-semibold text-slate-900 mb-1">Failed to load requests</p>
                                <p className="text-xs text-slate-400">Something went wrong. Please try again.</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-3xl text-slate-300">
                                        {activeFilter === 'pending' ? 'inbox' : 'filter_list'}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900 mb-1">
                                    {activeFilter === 'pending' ? 'No pending requests' : `No ${activeFilter} requests`}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {activeFilter === 'pending'
                                        ? "You're all caught up! No new requests to review."
                                        : `No requests match the "${activeFilter}" filter.`
                                    }
                                </p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                <div className="space-y-3">
                                    {filtered.map((request) => (
                                        <RequestCard
                                            key={request.id}
                                            request={request}
                                            onRespond={handleRespond}
                                            isResponding={respondingId === request.id}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default MentorshipRequestsPage;
