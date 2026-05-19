/**
 * RequestsTab — eaglet's mentorship/program request history.
 * Extracted from MyRequestsPage for in-Nest tab embedding (plan 14-05 T5).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyRequests } from '../../modules/nest/hooks/useNests';
import StatusBadge from '../../shared/components/ui/StatusBadge';
import EmptyState from '../../shared/components/ui/EmptyState';
import TabBar from '../../shared/components/ui/TabBar';
import { useEnums, isStatusInGroup } from '@hooks/useEnums';

const FILTER_TABS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending', icon: 'schedule' },
    { value: 'approved', label: 'Approved', icon: 'check_circle' },
    { value: 'declined', label: 'Declined', icon: 'cancel' },
];

const formatDate = (s) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function RequestsTab() {
    const [activeFilter, setActiveFilter] = useState('all');
    const { data: requestsResponse, isLoading, isError } = useMyRequests();
    const enums = useEnums();
    const groups = enums.enrollment_status_groups;

    const requests = requestsResponse?.data || requestsResponse?.results || requestsResponse || [];
    // Status grouping comes from BE (core/enums.py). FE never hardcodes the
    // member values — only the bucket names (pending/approved/declined).
    // Legacy "approved"/"accepted" still bucketed via enrollment_status_groups for old MentorshipRequest data.
    const filtered = activeFilter === 'all'
        ? requests
        : requests.filter(r => {
            const s = r.status?.toLowerCase();
            if (activeFilter === 'declined') return isStatusInGroup(groups, s, 'declined');
            if (activeFilter === 'approved') return isStatusInGroup(groups, s, 'approved') || s === 'approved' || s === 'accepted';
            return s === activeFilter;
        });

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status?.toLowerCase() === 'pending').length,
        approved: requests.filter(r => {
            const s = r.status?.toLowerCase();
            return isStatusInGroup(groups, s, 'approved') || s === 'approved' || s === 'accepted';
        }).length,
        declined: requests.filter(r => isStatusInGroup(groups, r.status?.toLowerCase(), 'declined')).length,
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-50 animate-pulse" />)}
            </div>
        );
    }

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900">My Requests</h2>
                <p className="text-sm text-slate-500 mt-1">Track your mentorship applications</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                <TabBar
                    tabs={FILTER_TABS.map(t => ({ ...t, count: counts[t.value] }))}
                    activeTab={activeFilter}
                    onChange={setActiveFilter}
                    className="px-2"
                />
                {isError ? (
                    <div className="p-8">
                        <EmptyState icon="error" title="Failed to load requests"
                            description="Something went wrong while fetching your requests." />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={activeFilter === 'all' ? 'mail' : 'filter_list'}
                            title={activeFilter === 'all' ? 'No requests yet' : `No ${activeFilter} requests`}
                            description={activeFilter === 'all'
                                ? "You haven't sent any mentorship requests yet."
                                : `No requests with "${activeFilter}" status.`}
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filtered.map((request, idx) => {
                            const nestName = request.nest_name || request.nest?.name || 'Unknown Nest';
                            const mentorName = request.mentor_name || request.nest?.mentor_name || '';
                            const status = request.status?.toLowerCase() || 'pending';
                            // Map BE status → StatusBadge variant via groups (single source of truth).
                            const isApproved = isStatusInGroup(groups, status, 'approved') || status === 'approved' || status === 'accepted';
                            const isDeclined = isStatusInGroup(groups, status, 'declined');
                            const mappedStatus = isApproved ? 'approved' : isDeclined ? 'declined' : 'pending';
                            const isAccessible = isApproved;
                            const nestId = request.nest_id || request.nest?.id;

                            return (
                                <div key={request.id || idx}
                                    className="px-4 md:px-6 py-4 hover:bg-slate-50/80 transition-colors group flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-primary text-lg">diversity_3</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{nestName}</p>
                                        {mentorName && <p className="text-xs text-slate-500 truncate">by {mentorName}</p>}
                                        {request.message && (
                                            <p className="text-xs text-slate-500 truncate mt-1">{request.message}</p>
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-xs text-slate-500 whitespace-nowrap">
                                        {formatDate(request.created_at || request.sent_at)}
                                    </div>
                                    <StatusBadge status={mappedStatus} size="sm" />
                                    {nestId && (
                                        <Link to={isAccessible
                                            ? `/eaglet/nest/${nestId}`
                                            : `/eaglet/mentor/${nestId}`}
                                            className="text-xs font-semibold text-primary hover:text-primary-dark whitespace-nowrap">
                                            View →
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
