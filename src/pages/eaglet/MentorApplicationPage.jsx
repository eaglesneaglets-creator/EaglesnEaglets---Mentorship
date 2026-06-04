import { useMemo, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import {
    useMyMentorApplication,
    useSubmitMentorApplication,
    useWithdrawMentorApplication,
} from '../../modules/mentor-application/hooks/useMentorApplication';
import { useMentorApplicationEligible } from '@store';
import { ConfirmModal } from '../../shared/components/ui/ConfirmModal';

const OBLIGATIONS = [
    'Safeguarding & mandatory reporting — prioritise mentee safety and escalate concerns.',
    'Professional boundaries — no romantic, sexual, financial, or exploitative relationships with mentees.',
    'Confidentiality — keep mentee information private unless safety or law requires disclosure.',
    'Anti-harassment & non-discrimination — zero tolerance.',
    'Honesty about qualifications — represent your experience truthfully.',
    'Approved channels — conduct mentorship through platform-approved communication.',
    'Conflict of interest — disclose, never exploit the role.',
    'Consequences — violations may lead to suspension or removal.',
];

function StatusBanner({ tone, icon, title, children }) {
    const tones = {
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        red: 'bg-red-50 border-red-200 text-red-900',
        slate: 'bg-slate-50 border-slate-200 text-slate-700',
    };
    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${tones[tone] || tones.slate}`}>
            {icon && (
                <span className="material-symbols-outlined text-2xl shrink-0 mt-0.5">{icon}</span>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{title}</p>
                {children && <div className="text-sm mt-1 leading-relaxed">{children}</div>}
            </div>
        </div>
    );
}

function PageShell({ children }) {
    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto p-6 sm:p-8">
                <div className="mb-6">
                    <Link
                        to="/eaglet/dashboard"
                        className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to dashboard
                    </Link>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                    Become a Mentor
                </h1>
                <p className="text-slate-600 mb-8">
                    You’ve reached the level required to mentor other eaglets. Review the
                    obligations below and submit your application — we’ll notify you when an
                    admin reviews it.
                </p>
                {children}
            </div>
        </DashboardLayout>
    );
}

function IneligibleView() {
    return (
        <PageShell>
            <StatusBanner tone="slate" icon="lock" title="You’re not eligible yet">
                Reach Level 5 in an active program to unlock the mentor application.
                Keep earning points and completing program objectives.
            </StatusBanner>
        </PageShell>
    );
}

function EligibleFormView({ rejected, cooldownUntil, onSubmit, submitting }) {
    const [agreed, setAgreed] = useState(false);
    const cooldownActive = cooldownUntil && new Date(cooldownUntil) > new Date();
    const cooldownDate = cooldownActive
        ? new Date(cooldownUntil).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null;

    return (
        <PageShell>
            {rejected?.rejection_reason && (
                <div className="mb-6">
                    <StatusBanner
                        tone="red"
                        icon="error"
                        title="Your previous application was not approved"
                    >
                        <p className="italic">“{rejected.rejection_reason}”</p>
                        <p className="text-xs mt-2 text-red-800/80">
                            {cooldownActive
                                ? `Re-apply available from ${cooldownDate}.`
                                : 'You can re-apply now. The reviewing admin will see your updated submission.'}
                        </p>
                    </StatusBanner>
                </div>
            )}

            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Mentor obligations</h2>
                <ul className="space-y-2.5">
                    {OBLIGATIONS.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">
                                check_circle
                            </span>
                            <span>{o}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-slate-500 mt-4">
                    Full text:{' '}
                    <Link
                        to="/mentor-code-of-conduct"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Mentor Code of Conduct ↗
                    </Link>
                </p>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm text-slate-700">
                        I have read the Mentor Code of Conduct and agree to uphold these
                        obligations if approved as a mentor.
                    </span>
                </label>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        disabled={!agreed || submitting || cooldownActive}
                        onClick={onSubmit}
                        title={cooldownActive ? `Re-apply available from ${cooldownDate}` : undefined}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting
                            ? 'Submitting…'
                            : cooldownActive
                            ? `Available ${cooldownDate}`
                            : 'Submit application'}
                    </button>
                    <Link
                        to="/eaglet/dashboard"
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                    >
                        Cancel
                    </Link>
                </div>
            </section>
        </PageShell>
    );
}

function SubmittedView({ application, onWithdraw, withdrawing }) {
    const [confirm, setConfirm] = useState(null);
    return (
        <PageShell>
            <StatusBanner
                tone="amber"
                icon="hourglass_top"
                title="Application pending review"
            >
                We’ll email you when an admin reviews your submission. You can withdraw
                this application any time before it’s decided.
            </StatusBanner>

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={withdrawing}
                    onClick={() =>
                        setConfirm({
                            title: 'Withdraw application?',
                            message:
                                'Your pending application will be cancelled. You can re-apply later if you change your mind.',
                            confirmLabel: 'Yes, withdraw',
                            variant: 'danger',
                            onConfirm: () => onWithdraw(application.id),
                        })
                    }
                    className="px-5 py-2.5 rounded-xl border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 disabled:opacity-50 transition"
                >
                    {withdrawing ? 'Withdrawing…' : 'Withdraw application'}
                </button>
                <Link
                    to="/eaglet/dashboard"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                    Back to dashboard
                </Link>
            </div>

            <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
        </PageShell>
    );
}

function ApprovedView() {
    return (
        <PageShell>
            <StatusBanner
                tone="emerald"
                icon="verified"
                title="You’re now a mentor!"
            >
                Your application was approved. Your account has been upgraded — open the
                mentor dashboard to set up your first nest.
            </StatusBanner>
            <div className="mt-6">
                <Link
                    to="/eagle/dashboard"
                    className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md hover:bg-emerald-700 transition"
                >
                    Open mentor dashboard
                </Link>
            </div>
        </PageShell>
    );
}

function WithdrawnView({ onReapply }) {
    return (
        <PageShell>
            <StatusBanner
                tone="slate"
                icon="undo"
                title="Application withdrawn"
            >
                You can re-apply whenever you’re ready.
            </StatusBanner>
            <div className="mt-6">
                <button
                    type="button"
                    onClick={onReapply}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 transition"
                >
                    Re-apply
                </button>
            </div>
        </PageShell>
    );
}

export default function MentorApplicationPage() {
    const navigate = useNavigate();
    const eligible = useMentorApplicationEligible();
    const { data: payload, isLoading } = useMyMentorApplication();
    const submit = useSubmitMentorApplication();
    const withdraw = useWithdrawMentorApplication();
    const [reapplyMode, setReapplyMode] = useState(false);

    const application = useMemo(() => payload?.data?.application ?? null, [payload]);
    const cooldownUntil = payload?.data?.cooldown_until ?? null;

    if (isLoading) {
        return (
            <PageShell>
                <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
            </PageShell>
        );
    }

    const status = application?.status ?? null;

    // Status routing —
    // approved: keep in view (even if user clicks elsewhere they land back here).
    // submitted: show pending + withdraw.
    // rejected (and not in re-apply mode): show eligible form with rejection banner.
    // withdrawn: show withdrawn view + re-apply CTA.
    // none/eligible: show fresh form.
    if (status === 'approved') {
        return <ApprovedView />;
    }

    if (status === 'submitted') {
        return (
            <SubmittedView
                application={application}
                onWithdraw={(id) => withdraw.mutate(id)}
                withdrawing={withdraw.isPending}
            />
        );
    }

    if (status === 'withdrawn' && !reapplyMode) {
        return <WithdrawnView onReapply={() => setReapplyMode(true)} />;
    }

    if (!eligible) {
        if (!application) {
            return <Navigate to="/eaglet/dashboard" replace />;
        }
        return <IneligibleView />;
    }

    return (
        <EligibleFormView
            rejected={status === 'rejected' ? application : null}
            cooldownUntil={cooldownUntil}
            submitting={submit.isPending}
            onSubmit={() => {
                submit.mutate(undefined, {
                    onSuccess: () => {
                        setReapplyMode(false);
                        navigate('/eaglet/mentor-application', { replace: true });
                    },
                });
            }}
        />
    );
}
