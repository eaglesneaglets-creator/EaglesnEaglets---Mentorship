/**
 * AdminTeamPage (plan 18-02) — manage current admin pool + outstanding invites.
 *
 * Layout:
 *   Header                    — title + "Invite admin" CTA
 *   Current admins            — table of stacked + pure admins
 *   Pending invites           — table of sent invites (copy link / revoke)
 */

import { useState } from 'react';
import { useAuthStore } from '@store';
import { toast } from '@shared/components/ui/toast-utils';
import DashboardLayout from '@shared/components/layout/DashboardLayout';
import SectionTabs from '@shared/components/layout/SectionTabs';
import InviteAdminModal from '@modules/admin-role/components/InviteAdminModal';
import NoteModal from '@modules/admin-role/components/NoteModal';
import {
  useAdminTeam,
  usePendingInvites,
  usePendingAdminRequests,
  useSendAdminInvite,
  useRevokeInvite,
  useRevokeAdmin,
  useSelfRevokeAdmin,
} from '@modules/admin-role/hooks/useAdminRole';

const TEAM_TABS_BASE = [
  { label: 'Team', to: '/admin/team' },
  { label: 'Admin Requests', to: '/admin/team/requests' },
];

function formatDate(iso) {
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
        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
      {initials || '?'}
    </div>
  );
}

function StackBadge({ member }) {
  if (member.is_superuser) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        Superadmin
      </span>
    );
  }
  if (member.is_stacked) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
        Mentor + Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      Admin
    </span>
  );
}

export default function AdminTeamPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.is_superuser === true;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [selfRevokeOpen, setSelfRevokeOpen] = useState(false);

  const { data: team = [], isLoading: teamLoading } = useAdminTeam();
  const { data: invites = [], isLoading: invitesLoading } = usePendingInvites(
    'sent',
    { enabled: isSuperAdmin },
  );
  const { data: pendingRequests = [] } = usePendingAdminRequests('pending');
  const tabs = TEAM_TABS_BASE.map((t) =>
    t.to === '/admin/team/requests' ? { ...t, badge: pendingRequests.length } : t,
  );

  const sendInvite = useSendAdminInvite();
  const revokeInvite = useRevokeInvite();
  const revokeMember = useRevokeAdmin();
  const selfRevoke = useSelfRevokeAdmin();

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/admin-role/accept/${token}`;
    navigator.clipboard?.writeText(link).then(
      () => toast.success('Invite link copied to clipboard.'),
      () => toast.error('Could not copy link.'),
    );
  };

  return (
    <DashboardLayout variant="admin">
      <div className="flex flex-col gap-6 min-h-full">
        {/* Sub-section tabs */}
        <SectionTabs tabs={tabs} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
                <span className="material-symbols-outlined text-white text-base">groups</span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                Admin Team
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Manage admins
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isSuperAdmin
                ? 'Current platform admins plus pending invites. Revoke or invite from here.'
                : 'View the admin team. Only superadmins can invite or revoke members.'}
            </p>
          </div>
          {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Invite admin
          </button>
          )}
        </div>

        {/* Current admins */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Current admins</h2>
            <span className="text-xs font-semibold text-slate-400">
              {team.length} {team.length === 1 ? 'admin' : 'admins'}
            </span>
          </div>
          {teamLoading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
          ) : team.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No admins yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {team.map((m) => {
                const isSelf = m.id === user?.id;
                return (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar user={m} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {m.full_name}
                            {isSelf && <span className="text-slate-400 font-normal"> (you)</span>}
                          </p>
                          <StackBadge member={m} />
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">{m.email}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {m.promoted_at
                            ? `Promoted ${formatDate(m.promoted_at)} via ${m.promoted_source || 'unknown'}`
                            : 'Legacy admin (no audit history)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isSuperAdmin && !m.is_superuser && (
                        isSelf ? (
                          <button
                            type="button"
                            onClick={() => setSelfRevokeOpen(true)}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Step down
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRevokeTarget(m)}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Revoke admin
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pending invites — superadmin only */}
        {isSuperAdmin && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Pending invites</h2>
            <span className="text-xs font-semibold text-slate-400">
              {invites.length} {invites.length === 1 ? 'invite' : 'invites'}
            </span>
          </div>
          {invitesLoading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
          ) : invites.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No pending invites. Use "Invite admin" to send one.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {invites.map((inv) => (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{inv.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sent {formatDate(inv.created_at)}
                      {inv.invited_by?.full_name && ` by ${inv.invited_by.full_name}`}
                      {' · expires '}{formatDate(inv.expires_at)}
                    </p>
                    {inv.message && (
                      <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                        “{inv.message}”
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(inv.token)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">link</span>
                      Copy link
                    </button>
                    <button
                      type="button"
                      onClick={() => revokeInvite.mutate(inv.id)}
                      disabled={revokeInvite.isPending}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

      <InviteAdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(payload) =>
          sendInvite.mutate(payload, { onSuccess: () => setInviteOpen(false) })
        }
        isLoading={sendInvite.isPending}
      />

      <NoteModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onSubmit={(reason) =>
          revokeMember.mutate(
            { userId: revokeTarget.id, reason },
            { onSuccess: () => setRevokeTarget(null) },
          )
        }
        isLoading={revokeMember.isPending}
        title={`Revoke admin for ${revokeTarget?.full_name || ''}?`}
        prompt={
          <>
            They will lose platform-admin privileges immediately.
            {revokeTarget?.is_stacked &&
              ' Their mentor role and Nest are unaffected.'}
            {' '}A reason is required and goes into the audit log.
          </>
        }
        noteRequired
        minLength={10}
        confirmLabel="Revoke admin"
        confirmVariant="danger"
        placeholder="Explain why this access is being removed…"
      />

      <NoteModal
        open={selfRevokeOpen}
        onClose={() => setSelfRevokeOpen(false)}
        onSubmit={(reason) =>
          selfRevoke.mutate(reason, { onSuccess: () => setSelfRevokeOpen(false) })
        }
        isLoading={selfRevoke.isPending}
        title="Step down from admin?"
        prompt="You'll lose platform-admin privileges immediately. Your mentor role and Nest are unaffected. You can re-request admin later if you change your mind."
        noteRequired={false}
        confirmLabel="Step down"
        confirmVariant="danger"
        placeholder="Optional note for the audit log…"
      />
      </div>
    </DashboardLayout>
  );
}
