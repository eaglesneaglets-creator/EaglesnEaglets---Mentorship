/**
 * AdminRequestsList — admin queue of EOI submissions (plan 18-02).
 *
 * Rendered inside the KYC Portal as the "Admin Requests" tab.
 */

import { useState } from 'react';
import { useAuthStore } from '@store';
import {
  usePendingAdminRequests,
  useApproveAdminRequest,
  useRejectAdminRequest,
} from '@modules/admin-role/hooks/useAdminRole';
import NoteModal from './NoteModal';

const STATUS_PILLS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'all', label: 'All' },
];

function formatRelative(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function Avatar({ user }) {
  const initials = `${user?.full_name || '?'}`
    .split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.full_name}
        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
      {initials || '?'}
    </div>
  );
}

function RequestRow({ req, currentUserId, onApprove, onReject }) {
  const isOwnRequest = req.user?.id === currentUserId;
  const status = req.status;
  const isPending = status === 'pending';

  const pillColor = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    withdrawn: 'bg-slate-50 text-slate-600 border-slate-200',
  }[status];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 ${
        isOwnRequest ? 'opacity-50' : ''
      }`}
    >
      <Avatar user={req.user} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-bold text-slate-900 truncate">
            {req.user?.full_name || '—'}
          </p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${pillColor}`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono truncate">{req.user?.email}</p>
        <p className="text-sm text-slate-700 mt-3 line-clamp-3 whitespace-pre-wrap">
          {req.reason}
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Submitted {formatRelative(req.created_at)}
          {req.decided_at && ` · Reviewed ${formatRelative(req.decided_at)}`}
          {req.decided_by?.full_name && ` by ${req.decided_by.full_name}`}
        </p>
        {!isPending && req.decision_note && (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Decision note
            </p>
            <p className="text-xs text-slate-600 whitespace-pre-wrap">
              {req.decision_note}
            </p>
          </div>
        )}
      </div>
      {isPending && !isOwnRequest && (
        <div className="flex sm:flex-col gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onApprove(req)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(req)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
      {isOwnRequest && (
        <p className="text-xs text-slate-400 italic sm:max-w-[140px] sm:text-right">
          You cannot approve your own request.
        </p>
      )}
    </div>
  );
}

export default function AdminRequestsList() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: requests = [], isLoading } = usePendingAdminRequests(statusFilter);
  const approveMut = useApproveAdminRequest();
  const rejectMut = useRejectAdminRequest();

  const pendingCount = statusFilter === 'pending'
    ? requests.length
    : null;

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_PILLS.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setStatusFilter(pill.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === pill.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {pill.label}
            {pill.value === 'pending' && pendingCount !== null && pendingCount > 0 && (
              <span className="ml-1 opacity-80">({pendingCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-400">
          Loading requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
          <p className="text-sm text-slate-500 mt-2">
            {statusFilter === 'pending'
              ? 'No pending admin requests. New submissions appear here automatically.'
              : `No ${statusFilter} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestRow
              key={req.id}
              req={req}
              currentUserId={user?.id}
              onApprove={setApproveTarget}
              onReject={setRejectTarget}
            />
          ))}
        </div>
      )}

      <NoteModal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onSubmit={(note) =>
          approveMut.mutate(
            { id: approveTarget.id, note },
            { onSuccess: () => setApproveTarget(null) },
          )
        }
        isLoading={approveMut.isPending}
        title={`Approve ${approveTarget?.user?.full_name || ''}?`}
        prompt="They will gain platform-admin privileges immediately and keep their mentor role. A note is optional but visible in the audit log."
        noteRequired={false}
        confirmLabel="Approve"
        confirmVariant="primary"
        placeholder="Optional note for the audit log…"
      />

      <NoteModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={(note) =>
          rejectMut.mutate(
            { id: rejectTarget.id, note },
            { onSuccess: () => setRejectTarget(null) },
          )
        }
        isLoading={rejectMut.isPending}
        title={`Reject ${rejectTarget?.user?.full_name || ''}?`}
        prompt="Share a brief reason — the requester will see this in their account settings and via email."
        noteRequired
        minLength={10}
        confirmLabel="Reject request"
        confirmVariant="danger"
        placeholder="Why this request isn't being approved right now…"
      />
    </div>
  );
}
