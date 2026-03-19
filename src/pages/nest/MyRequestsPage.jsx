/**
 * MyRequestsPage — Eaglet's view of their mentorship requests
 *
 * Inspired by Image 5 — table with status badges, date, nest name, row hover.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useMyRequests } from '../../modules/nest/hooks/useNests';
import StatusBadge from '../../shared/components/ui/StatusBadge';
import EmptyState from '../../shared/components/ui/EmptyState';
import TabBar from '../../shared/components/ui/TabBar';

const FILTER_TABS = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending', icon: 'schedule' },
    { value: 'approved', label: 'Approved', icon: 'check_circle' },
    { value: 'declined', label: 'Declined', icon: 'cancel' },
];

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const MyRequestsPage = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const { data: requestsResponse, isLoading, isError } = useMyRequests();

    const requests = requestsResponse?.data || requestsResponse?.results || requestsResponse || [];
    const filtered = activeFilter === 'all'
        ? requests
        : requests.filter(r => r.status?.toLowerCase() === activeFilter);

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status?.toLowerCase() === 'pending').length,
        approved: requests.filter(r => r.status?.toLowerCase() === 'approved').length,
        declined: requests.filter(r => r.status?.toLowerCase() === 'declined' || r.status?.toLowerCase() === 'rejected').length,
    };

    if (isLoading) {
        return (
            <DashboardLayout variant="eaglet">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 rounded-xl bg-slate-50 animate-pulse" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="eaglet">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">My Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">Track your mentorship applications</p>
                    </div>
                    <Link
                        to="/eaglet/nest"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-lg">search</span>
                        Find Mentors
                    </Link>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total', count: counts.all, icon: 'description', color: 'bg-slate-50 text-slate-600' },
                        { label: 'Pending', count: counts.pending, icon: 'schedule', color: 'bg-amber-50 text-amber-600' },
                        { label: 'Approved', count: counts.approved, icon: 'check_circle', color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Declined', count: counts.declined, icon: 'cancel', color: 'bg-red-50 text-red-600' },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-slate-900">{stat.count}</p>
                                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs + Table */}
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                    <TabBar
                        tabs={FILTER_TABS.map(t => ({ ...t, count: counts[t.value] }))}
                        activeTab={activeFilter}
                        onChange={setActiveFilter}
                        className="px-2"
                    />

                    {isError ? (
                        <div className="p-8">
                            <EmptyState
                                icon="error"
                                title="Failed to load requests"
                                description="Something went wrong while fetching your requests. Please try again."
                            />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                icon={activeFilter === 'all' ? 'mail' : 'filter_list'}
                                title={activeFilter === 'all' ? 'No requests yet' : `No ${activeFilter} requests`}
                                description={
                                    activeFilter === 'all'
                                        ? "You haven't sent any mentorship requests yet. Browse mentors to find your perfect match."
                                        : `You don't have any requests with "${activeFilter}" status.`
                                }
                                actionLabel={activeFilter === 'all' ? 'Find Mentors' : undefined}
                                actionLink={activeFilter === 'all' ? '/eaglet/nest' : undefined}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Desktop table header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-4">Nest / Mentor</div>
                                <div className="col-span-3">Message</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-slate-100">
                                {filtered.map((request, idx) => {
                                    const nestName = request.nest_name || request.nest?.name || 'Unknown Nest';
                                    const mentorName = request.mentor_name || request.nest?.mentor_name || '';
                                    const status = request.status?.toLowerCase() || 'pending';
                                    const statusMap = {
                                        pending: 'pending',
                                        approved: 'approved',
                                        accepted: 'approved',
                                        declined: 'declined',
                                        rejected: 'declined',
                                    };

                                    return (
                                        <div
                                            key={request.id || idx}
                                            className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors duration-200 group"
                                            style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both` }}
                                        >
                                            {/* Nest/Mentor */}
                                            <div className="md:col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-lg">diversity_3</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{nestName}</p>
                                                    {mentorName && (
                                                        <p className="text-xs text-slate-500 truncate">by {mentorName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div className="md:col-span-3 flex items-center">
                                                <p className="text-sm text-slate-600 truncate">
                                                    {request.message || '—'}
                                                </p>
                                            </div>

                                            {/* Date */}
                                            <div className="md:col-span-2 flex items-center">
                                                <div>
                                                    <p className="text-sm text-slate-700 font-medium">{formatDate(request.created_at || request.sent_at)}</p>
                                                    <p className="text-xs text-slate-400">{formatTime(request.created_at || request.sent_at)}</p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="md:col-span-2 flex items-center">
                                                <StatusBadge status={statusMap[status] || 'pending'} size="sm" />
                                            </div>

                                            {/* Action */}
                                            <div className="md:col-span-1 flex items-center justify-end">
                                                {status === 'approved' || status === 'accepted' ? (
                                                    <Link
                                                        to={`/eaglet/nest/${request.nest_id || request.nest?.id}`}
                                                        className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                                                    >
                                                        View Nest
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={`/eaglet/mentor/${request.nest_id || request.nest?.id}`}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-slate-400 hover:text-primary"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </DashboardLayout>
    );
};

export default MyRequestsPage;
