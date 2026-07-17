/**
 * AdminMentorApplicationsPage — admin queue for the mentor-application
 * lifecycle (plan 16-03). Sibling of /admin/users + /admin/kyc, reachable via
 * the shared SectionTabs strip.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import SectionTabs from '../../shared/components/layout/SectionTabs';
import ReasonModal from '../../modules/program/components/ReasonModal';
import {
    useAdminMentorApplications,
    useAdminDecideMentorApplication,
} from '../../modules/mentor-application/hooks/useMentorApplicationAdmin';
import { ADMIN_USERS_TABS } from './adminUsersTabs';

const STATUS_TABS = [
    { value: 'submitted', label: 'Submitted', icon: 'schedule' },
    { value: 'approved', label: 'Approved', icon: 'verified' },
    { value: 'rejected', label: 'Rejected', icon: 'cancel' },
    { value: 'withdrawn', label: 'Withdrawn', icon: 'undo' },
];

const REJECT_MIN = 10;

function StatusBadge({ status }) {
    const map = {
        submitted: 'bg-amber-50 text-amber-800 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        rejected: 'bg-red-50 text-red-800 border-red-200',
        withdrawn: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
        <span
            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md border capitalize ${map[status] || map.withdrawn}`}
        >
            {status}
        </span>
    );
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

function ActionButtons({ app, onApprove, onReject, busy }) {
    if (app.status !== 'submitted') {
        return <StatusBadge status={app.status} />;
    }
    return (
        <div className="flex gap-2">
            <button
                type="button"
                disabled={busy}
                onClick={() => onApprove(app)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
                Approve
            </button>
            <button
                type="button"
                disabled={busy}
                onClick={() => onReject(app)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
            >
                Reject
            </button>
        </div>
    );
}

function KycLink({ app }) {
    if (!app.mentor_kyc) return <span className="text-xs text-slate-400">No KYC linked</span>;
    return (
        <Link
            to={`/admin/kyc/${app.mentor_kyc}?role=mentor`}
            className="text-xs font-semibold text-primary hover:text-primary/80"
        >
            View KYC →
        </Link>
    );
}

function DesktopTable({ apps, onApprove, onReject, busy, showReason }) {
    return (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Applicant</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">KYC</th>
                        {showReason && (
                            <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Reason</th>
                        )}
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {apps.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-slate-900">{app.user_full_name || '—'}</p>
                                <p className="text-xs text-slate-500">{app.user_email}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">{formatDate(app.submitted_at)}</td>
                            <td className="px-5 py-4"><KycLink app={app} /></td>
                            {showReason && (
                                <td className="px-5 py-4 text-xs text-red-700 max-w-xs">
                                    {app.rejection_reason || '—'}
                                </td>
                            )}
                            <td className="px-5 py-4 text-right">
                                <ActionButtons app={app} onApprove={onApprove} onReject={onReject} busy={busy} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MobileCards({ apps, onApprove, onReject, busy, showReason }) {
    return (
        <div className="md:hidden space-y-3">
            {apps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{app.user_full_name || '—'}</p>
                    <p className="text-xs text-slate-500 mb-2">{app.user_email}</p>
                    <p className="text-xs text-slate-500">Submitted: {formatDate(app.submitted_at)}</p>
                    <div className="mt-2"><KycLink app={app} /></div>
                    {showReason && app.rejection_reason && (
                        <p className="text-xs text-red-700 mt-2 italic">“{app.rejection_reason}”</p>
                    )}
                    <div className="mt-3">
                        <ActionButtons app={app} onApprove={onApprove} onReject={onReject} busy={busy} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ status }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">inbox</span>
            <p className="mt-3 text-sm font-semibold text-slate-700">
                No {status} applications
            </p>
            <p className="text-xs text-slate-500 mt-1">
                When mentees apply or get reviewed, they’ll show up here.
            </p>
        </div>
    );
}

function ErrorBanner({ onRetry }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-800">
                Failed to load applications. Try again.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
                Retry
            </button>
        </div>
    );
}

function SkeletonRows() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
        </div>
    );
}

export default function AdminMentorApplicationsPage() {
    const [tab, setTab] = useState('submitted');
    const [reasonConfig, setReasonConfig] = useState(null);

    const query = useAdminMentorApplications(tab);
    const decide = useAdminDecideMentorApplication();

    const apps = useMemo(() => query.data?.data ?? [], [query.data]);
    const showReason = tab === 'rejected';

    const handleApprove = (app) => {
        if (!window.confirm(`Approve mentor application from ${app.user_full_name || app.user_email}?`)) {
            return;
        }
        decide.mutate({ id: app.id, action: 'approve', body: {} });
    };

    const handleReject = (app) => {
        setReasonConfig({
            title: `Reject application from ${app.user_full_name || app.user_email}`,
            message: `Reason will be shown to the applicant. Minimum ${REJECT_MIN} characters.`,
            confirmLabel: 'Reject application',
            variant: 'danger',
            required: true,
            minLength: REJECT_MIN,
            onConfirm: (reason) =>
                decide.mutate({ id: app.id, action: 'reject', body: { reason } }),
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <SectionTabs tabs={ADMIN_USERS_TABS} />

                <div className="mt-6">
                    <h1 className="text-2xl font-extrabold text-slate-900">Mentor Applications</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Review Level-5 mentees applying to become mentors. Approve to promote
                        them to Eagle; reject with a reason if not yet ready.
                    </p>
                </div>

                {/* Status tab strip */}
                <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setTab(t.value)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                tab === t.value
                                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="mt-4">
                    {query.isLoading ? (
                        <SkeletonRows />
                    ) : query.isError ? (
                        <ErrorBanner onRetry={() => query.refetch()} />
                    ) : apps.length === 0 ? (
                        <EmptyState status={tab} />
                    ) : (
                        <>
                            <DesktopTable
                                apps={apps}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                busy={decide.isPending}
                                showReason={showReason}
                            />
                            <MobileCards
                                apps={apps}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                busy={decide.isPending}
                                showReason={showReason}
                            />
                        </>
                    )}
                </div>

                <ReasonModal config={reasonConfig} onClose={() => setReasonConfig(null)} />
            </div>
        </DashboardLayout>
    );
}
