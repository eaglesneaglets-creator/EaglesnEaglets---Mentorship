/**
 * Admin Role Section (plan 18-02) — mounts inside Account settings for
 * mentors only. Renders one of five states:
 *   A. Eligible           — show explain card + Submit button
 *   B. Pending             — show submitted status + Withdraw button
 *   C. Approved            — congratulatory state, points at role switcher
 *   D. Rejected            — show rejection note + cooldown notice
 *   E. Ineligible          — list unmet criteria
 *
 * Mentees never see this section (the parent component conditional-renders).
 */

import { useState } from 'react';
import {
  useAdminRoleEligibility,
  useMyAdminRequest,
  useSubmitAdminRequest,
  useWithdrawAdminRequest,
} from '@modules/admin-role/hooks/useAdminRole';
import EOISubmitModal from '@modules/admin-role/components/EOISubmitModal';

const STATUS_BADGES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending review' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Not approved' },
  withdrawn: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Withdrawn' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function SectionShell({ icon, iconBg, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminRoleSection() {
  const [eoiOpen, setEoiOpen] = useState(false);

  const { data: eligibility, isLoading: eligLoading } = useAdminRoleEligibility();
  const { data: myRequest, isLoading: reqLoading } = useMyAdminRequest();

  const submitMutation = useSubmitAdminRequest();
  const withdrawMutation = useWithdrawAdminRequest();

  if (eligLoading || reqLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="h-5 w-40 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  const pending = myRequest?.status === 'pending' ? myRequest : null;
  const lastDecided = myRequest && myRequest.status !== 'pending' ? myRequest : null;

  // ─── State C: Approved (user is now an admin) ─────────────────────────────
  if (lastDecided?.status === 'approved') {
    return (
      <SectionShell
        icon="shield_person"
        iconBg="bg-emerald-50 text-emerald-600"
        title="Admin role — active"
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          You're now part of the admin team. Use the role switcher in the
          sidebar profile to jump between your mentor view and admin view at
          any time. Your Nest and mentees are unaffected.
        </p>
        <p className="text-xs text-slate-400 mt-3">
          Approved {formatDate(lastDecided.decided_at)}
          {lastDecided.decided_by?.full_name && ` · by ${lastDecided.decided_by.full_name}`}
        </p>
      </SectionShell>
    );
  }

  // ─── State B: Pending ─────────────────────────────────────────────────────
  if (pending) {
    const badge = STATUS_BADGES.pending;
    return (
      <SectionShell
        icon="hourglass_top"
        iconBg="bg-amber-50 text-amber-600"
        title="Admin role request — pending review"
      >
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {badge.label}
        </span>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Your request is in the queue. The admin team will review it and
          you&apos;ll receive an email with the decision. You can withdraw
          your request at any time before it&apos;s decided.
        </p>
        <p className="text-xs text-slate-400 mt-3">
          Submitted {formatDate(pending.created_at)}
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => withdrawMutation.mutate()}
            disabled={withdrawMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">close</span>
            {withdrawMutation.isPending ? 'Withdrawing…' : 'Withdraw request'}
          </button>
        </div>
      </SectionShell>
    );
  }

  // ─── State D: Rejected (or withdrawn) — show resubmit when eligible ──────
  if (lastDecided?.status === 'rejected' || lastDecided?.status === 'withdrawn') {
    const badge = STATUS_BADGES[lastDecided.status];
    return (
      <SectionShell
        icon={lastDecided.status === 'rejected' ? 'close' : 'undo'}
        iconBg={lastDecided.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}
        title={lastDecided.status === 'rejected' ? 'Previous request — not approved' : 'Previous request — withdrawn'}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.label}
        </span>
        {lastDecided.decision_note && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Reviewer note
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {lastDecided.decision_note}
            </p>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3">
          {lastDecided.status === 'rejected' ? 'Reviewed' : 'Withdrawn'} {formatDate(lastDecided.decided_at)}
        </p>
        {eligibility?.eligible && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setEoiOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              Submit a new request
            </button>
          </div>
        )}
        <EOISubmitModal
          open={eoiOpen}
          onClose={() => setEoiOpen(false)}
          onSubmit={(reason) =>
            submitMutation.mutate(reason, { onSuccess: () => setEoiOpen(false) })
          }
          isLoading={submitMutation.isPending}
        />
      </SectionShell>
    );
  }

  // ─── State E: Ineligible ──────────────────────────────────────────────────
  if (!eligibility?.eligible) {
    return (
      <SectionShell
        icon="lock"
        iconBg="bg-slate-100 text-slate-500"
        title="Admin role — not yet available"
      >
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Once you meet the requirements below, you can request to join the
          platform admin team without losing your mentor role.
        </p>
        <ul className="space-y-2 mt-2">
          {(eligibility?.reasons || []).map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">remove</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </SectionShell>
    );
  }

  // ─── State A: Eligible (no request) ───────────────────────────────────────
  return (
    <SectionShell
      icon="shield_person"
      iconBg="bg-emerald-50 text-emerald-600"
      title="Request admin role"
    >
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        You meet the eligibility criteria to apply for the admin team. Approved
        admins keep their mentor role and Nest — admin capabilities are added
        on top, with a role switcher in the sidebar to flip between contexts.
      </p>
      <button
        type="button"
        onClick={() => setEoiOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all"
      >
        <span className="material-symbols-outlined text-base">send</span>
        Submit request
      </button>
      <EOISubmitModal
        open={eoiOpen}
        onClose={() => setEoiOpen(false)}
        onSubmit={(reason) =>
          submitMutation.mutate(reason, { onSuccess: () => setEoiOpen(false) })
        }
        isLoading={submitMutation.isPending}
      />
    </SectionShell>
  );
}
