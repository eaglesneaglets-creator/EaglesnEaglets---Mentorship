/**
 * EnrollmentQueuePage — mentor's enrollment management surface (plan 14-06 T4).
 *
 * Routes: /eagle/nests/:nestId/enrollments
 *
 * Tabs: Pending / Active / Completed / Exit Requests
 */
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import TabBar from '../../shared/components/ui/TabBar';
import EmptyState from '../../shared/components/ui/EmptyState';
import {
    useEnrollments,
    useApproveEnrollment,
    useRejectEnrollment,
    useReleaseEnrollment,
    useCompleteEnrollment,
    useExitRequests,
    useDecideExitRequest,
} from '../../modules/program/hooks/useEnrollments';
import { usePrograms } from '../../modules/program/hooks/usePrograms';
import EnrollmentRow from '../../modules/program/components/EnrollmentRow';
import ReasonModal from '../../modules/program/components/ReasonModal';
import { useEnums } from '@hooks/useEnums';

// Tab structure (value + icon are FE-owned). Label resolved at render time
// from the BE-served enrollment_status enum so server-side label changes
// flow through automatically.
const TAB_KEYS = [
    { value: 'pending', icon: 'schedule', fallbackLabel: 'Pending' },
    { value: 'active', icon: 'group', fallbackLabel: 'Active' },
    { value: 'completed', icon: 'check_circle', fallbackLabel: 'Completed' },
    { value: 'exit', icon: 'logout', fallbackLabel: 'Exit Requests' }, // not a status — local route

];

export default function EnrollmentQueuePage() {
    const { nestId } = useParams();
    const enums = useEnums();
    const statusLabels = enums.enrollment_status || {};
    const TABS = TAB_KEYS.map((t) => ({
        value: t.value,
        icon: t.icon,
        label: statusLabels[t.value] || t.fallbackLabel,
    }));
    const [activeTab, setActiveTab] = useState('pending');
    const [reasonConfig, setReasonConfig] = useState(null);

    const { data: programsData } = usePrograms(nestId);
    const programs = programsData?.data || programsData?.results || programsData || [];
    const program = Array.isArray(programs) ? programs[0] : programs;
    const hasProgram = Boolean(program?.id);

    const filterStatus = activeTab === 'exit' ? null : activeTab;
    const { data: enrollData, isLoading } = useEnrollments(
        filterStatus ? { nest_id: nestId, status: filterStatus } : null
    );
    const { data: exitData, isLoading: exitLoading } = useExitRequests();

    const approve = useApproveEnrollment();
    const reject = useRejectEnrollment();
    const release = useReleaseEnrollment();
    const complete = useCompleteEnrollment();
    const decideExit = useDecideExitRequest();

    const rows = useMemo(() => {
        if (activeTab === 'exit') {
            const list = exitData?.data || exitData?.results || exitData || [];
            return Array.isArray(list) ? list : [];
        }
        const list = enrollData?.data || enrollData?.results || enrollData || [];
        return Array.isArray(list) ? list : [];
    }, [activeTab, enrollData, exitData]);

    const isPending = approve.isPending || reject.isPending || release.isPending
        || complete.isPending || decideExit.isPending;

    // ---------- Action handlers --------------------------------------------------
    const handleApprove = (id) => {
        if (!hasProgram) {
            setReasonConfig(null);
            return;
        }
        approve.mutate(id);
    };

    const handleReject = (enrollment) => {
        setReasonConfig({
            title: `Reject ${enrollment.mentee_name || 'application'}?`,
            message: 'The mentee will be notified. They can re-apply later.',
            confirmLabel: 'Reject',
            variant: 'danger',
            required: false,
            onConfirm: (reason) => reject.mutate({ id: enrollment.id, reason }),
        });
    };

    const handleRelease = (enrollment) => {
        setReasonConfig({
            title: `Release ${enrollment.mentee_name || 'mentee'}?`,
            message: 'This ends the active enrollment. The mentee keeps their progress history.',
            confirmLabel: 'Release',
            variant: 'danger',
            required: true,
            onConfirm: (reason) => release.mutate({ id: enrollment.id, reason }),
        });
    };

    const handleComplete = (id) => complete.mutate(id);

    const handleExitApprove = (enrollment) => {
        setReasonConfig({
            title: 'Approve exit request?',
            message: 'Mentee will be released from the program.',
            confirmLabel: 'Approve Exit',
            variant: 'primary',
            required: false,
            onConfirm: (reason) => decideExit.mutate({ id: enrollment.id, decision: 'approve', reason }),
        });
    };

    const handleExitDeny = (enrollment) => {
        setReasonConfig({
            title: 'Deny exit request?',
            message: 'Mentee stays enrolled. Share your reasoning.',
            confirmLabel: 'Deny Exit',
            variant: 'danger',
            required: true,
            onConfirm: (reason) => decideExit.mutate({ id: enrollment.id, decision: 'deny', reason }),
        });
    };

    // ---------- Render -----------------------------------------------------------
    if (!hasProgram) {
        return (
            <DashboardLayout variant="eagle">
                <div className="max-w-3xl mx-auto">
                    <EmptyState
                        icon="workspaces"
                        title="No program defined yet"
                        description="Create a program before you can manage enrollments."
                        actionLabel="Create Program"
                        actionLink={`/eagle/nests/${nestId}/program`}
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="eagle">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Link to={`/eagle/nests/${nestId}`} className="hover:text-primary inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to Nest
                    </Link>
                </div>

                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Enrollments</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage applications, active mentees, and exit requests for {program.name}.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="px-2" />

                    {(isLoading || (activeTab === 'exit' && exitLoading)) ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                icon={TABS.find((t) => t.value === activeTab)?.icon || 'inbox'}
                                title={`No ${activeTab} enrollments`}
                                description={
                                    activeTab === 'pending' ? 'New applications will appear here.'
                                        : activeTab === 'active' ? 'Approved mentees show up here.'
                                            : activeTab === 'completed' ? 'Completed program runs land here.'
                                                : 'Mentee opt-out requests show up here.'
                                }
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {rows.map((row) => (
                                <EnrollmentRow
                                    key={row.id}
                                    enrollment={row}
                                    variant={activeTab}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onRelease={handleRelease}
                                    onComplete={handleComplete}
                                    onExitApprove={handleExitApprove}
                                    onExitDeny={handleExitDeny}
                                    isPending={isPending}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <ReasonModal config={reasonConfig} onClose={() => setReasonConfig(null)} />
            </div>
        </DashboardLayout>
    );
}
