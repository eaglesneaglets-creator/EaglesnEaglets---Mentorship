/**
 * AdminUsersPage
 *
 * Matches the platform's light glass-morphism aesthetic with blue-indigo admin
 * accent, shared StatCard gradient cards, and Tailwind slate palette.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import StatCard from '../../shared/components/ui/StatCard';
import { ConfirmModal } from '../../shared/components/ui/ConfirmModal';
import { adminService } from '../../modules/auth/services/auth-service';
import { formatRelativeTime } from '../../shared/utils';
import { toast } from 'sonner'; // H19: standardise on sonner (was react-hot-toast)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  eagle:  { label: 'Eagle',  bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  eaglet: { label: 'Eaglet', bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500' },
  admin:  { label: 'Admin',  bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500' },
};

const STATUS_CONFIG = {
  active:    { label: 'Active',    bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  suspended: { label: 'Suspended', bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
  pending:   { label: 'Pending',   bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500' },
  inactive:  { label: 'Inactive',  bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400' },
};

const KYC_CONFIG = {
  approved:         { label: 'Verified',   icon: 'verified',      color: 'text-emerald-600' },
  submitted:        { label: 'Pending',    icon: 'hourglass_top', color: 'text-amber-600' },
  under_review:     { label: 'Review',     icon: 'rate_review',   color: 'text-blue-600' },
  rejected:         { label: 'Rejected',   icon: 'cancel',        color: 'text-red-600' },
  requires_changes: { label: 'Changes',    icon: 'edit',          color: 'text-orange-600' },
  draft:            { label: 'Incomplete', icon: 'draft',         color: 'text-slate-400' },
};

const SORT_COLUMNS = {
  User:         { asc: 'first_name',  desc: '-first_name' },
  Role:         { asc: 'role',        desc: '-role' },
  Status:       { asc: 'status',      desc: '-status' },
  KYC:          { asc: 'kyc_status',  desc: '-kyc_status' },
  Joined:       { asc: 'created_at',  desc: '-created_at' },
  'Last Login': { asc: 'last_login',  desc: '-last_login' },
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

// ─── Export Utility ──────────────────────────────────────────────────────────

const exportUsersCSV = (users) => {
  const headers = ['Name', 'Email', 'Role', 'Status', 'KYC', 'Joined', 'Last Login'];
  const rows = users.map(u => [
    u.full_name || '',
    u.email || '',
    u.role || '',
    u.status || '',
    u.kyc_status || '',
    u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '',
    u.last_login ? new Date(u.last_login).toISOString().split('T')[0] : '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported successfully');
};

// ─── Suspend Modal ────────────────────────────────────────────────────────────

const SuspendModal = ({ user, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/50"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl text-red-600">person_off</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-red-600">Suspend Account</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{user?.full_name}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          This will immediately revoke platform access. Provide a reason (min 10 characters).
        </p>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for suspension…"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
        />
        <p className={`text-xs mt-1 text-right ${reason.trim().length < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
          {reason.trim().length}/10 min chars
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!valid || isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 bg-red-500 text-white hover:bg-red-600 min-h-[44px]"
          >
            {isLoading ? 'Suspending…' : 'Suspend User'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── User Detail Slide-over Panel ────────────────────────────────────────────

const DetailRow = ({ label, value, icon, mono = false }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="material-symbols-outlined text-base mt-0.5 shrink-0 text-slate-400">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">{label}</p>
      <p className={`text-sm text-slate-700 truncate ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </p>
    </div>
  </div>
);

const UserDetailPanel = ({ user, onClose, onSuspend, onReactivate }) => {
  if (!user) return null;
  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.eaglet;
  const st = STATUS_CONFIG[user.status] || STATUS_CONFIG.inactive;
  const kyc = KYC_CONFIG[user.kyc_status] || KYC_CONFIG.draft;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md h-full overflow-y-auto bg-white border-l border-slate-200 shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all hover:bg-slate-100 z-10"
        >
          <span className="material-symbols-outlined text-lg text-slate-400">close</span>
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-5 bg-gradient-to-b from-blue-50/60 to-white">
          <div className="flex items-start gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-white shadow-md"
              />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 border-2 border-white shadow-md ${role.bg} ${role.text}`}>
                {getInitials(user.full_name)}
              </div>
            )}
            <div className="min-w-0 pt-1">
              <h3 className="text-xl font-bold text-slate-900 leading-tight truncate">{user.full_name || '—'}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${role.bg} ${role.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
                  {role.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.bg} ${st.text}`}>
                  {user.status === 'active' && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${st.dot}`} />}
                  {st.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Detail rows */}
        <div className="px-6 py-2">
          <DetailRow label="User ID" value={user.id} icon="fingerprint" mono />
          <DetailRow label="Phone Number" value={user.phone_number} icon="call" mono />
          <DetailRow label="KYC Status" value={kyc.label} icon={kyc.icon} />
          <DetailRow label="Date Joined" value={formatDate(user.created_at)} icon="calendar_today" mono />
          <DetailRow label="Last Login" value={formatRelativeTime(user.last_login)} icon="schedule" mono />
          {user.nest_name && <DetailRow label="Nest" value={user.nest_name} icon="groups" />}
          {user.total_points !== undefined && <DetailRow label="Points" value={user.total_points?.toLocaleString()} icon="stars" mono />}
          {user.bio && <DetailRow label="Bio" value={user.bio} icon="description" />}
        </div>

        {/* Activity summary — role-specific metrics from backend */}
        <div className="mx-6 mt-4 rounded-xl p-4 bg-slate-50 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider mb-3 font-bold text-slate-400">
            {user.role === 'eagle' ? 'Mentor Activity' : 'Learner Progress'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(user.role === 'eagle' ? [
              { label: 'Eaglets', value: user.eaglets_count ?? 0, icon: 'school', color: 'text-blue-600' },
              { label: 'Nests', value: user.nests_count ?? 0, icon: 'groups', color: 'text-emerald-600' },
              { label: 'Content', value: user.content_created ?? 0, icon: 'upload_file', color: 'text-amber-600' },
            ] : [
              { label: 'Points', value: user.total_points ?? 0, icon: 'stars', color: 'text-blue-600' },
              { label: 'Completed', value: user.content_completed ?? 0, icon: 'task_alt', color: 'text-emerald-600' },
              { label: 'Assignments', value: user.assignments_completed ?? 0, icon: 'assignment_turned_in', color: 'text-amber-600' },
            ]).map(({ label, value, icon, color }) => (
              <div key={label} className="text-center">
                <span className={`material-symbols-outlined text-base mb-1 block ${color} opacity-60`}>{icon}</span>
                <p className={`text-lg font-bold font-mono ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5 text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {user.role !== 'admin' && (
          <div className="px-6 py-6">
            {user.status === 'suspended' ? (
              <button
                onClick={() => { onReactivate(user); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98] min-h-[44px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                <span className="material-symbols-outlined text-lg">person_check</span>
                Reactivate Account
              </button>
            ) : (
              <button
                onClick={() => { onSuspend(user); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98] min-h-[44px] bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              >
                <span className="material-symbols-outlined text-lg">person_off</span>
                Suspend Account
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Bulk Action Bar ─────────────────────────────────────────────────────────

const BulkActionBar = ({ count, onSuspendAll, onDeselectAll }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-2xl"
  >
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
        {count}
      </div>
      <span className="text-xs font-semibold text-slate-500">selected</span>
    </div>

    <div className="w-px h-5 bg-slate-200" />

    <button
      onClick={onSuspendAll}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 min-h-[36px] bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
    >
      <span className="material-symbols-outlined text-sm">person_off</span>
      Suspend
    </button>

    <button
      onClick={onDeselectAll}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 min-h-[36px] bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
    >
      <span className="material-symbols-outlined text-sm">close</span>
      Clear
    </button>
  </motion.div>
);

// ─── User Row ─────────────────────────────────────────────────────────────────

const UserRow = ({ user, index, onSuspend, onReactivate, selected, onSelect, onViewDetail }) => {
  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.eaglet;
  const st = STATUS_CONFIG[user.status] || STATUS_CONFIG.inactive;
  const kyc = KYC_CONFIG[user.kyc_status] || KYC_CONFIG.draft;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="cursor-pointer group hover:bg-slate-50/80 transition-colors duration-200 border-b border-slate-100 last:border-0"
      onClick={() => onViewDetail(user)}
    >
      {/* Checkbox */}
      <td className="pl-4 pr-1 py-4 w-10">
        <label
          className="flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
          onClick={e => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(user.id)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
          />
        </label>
      </td>

      {/* Avatar + Name */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:border-primary/30 transition-colors"
              />
            ) : (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-200 group-hover:border-primary/30 transition-colors ${role.bg} ${role.text}`}>
                {getInitials(user.full_name)}
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${st.dot}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || '—'}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${role.bg} ${role.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
          {role.label}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
          {user.status === 'active' && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${st.dot}`} />}
          {st.label}
        </span>
      </td>

      {/* KYC */}
      <td className="px-4 py-4">
        <span className={`flex items-center gap-1.5 text-xs ${kyc.color}`}>
          <span className="material-symbols-outlined text-sm">{kyc.icon}</span>
          {kyc.label}
        </span>
      </td>

      {/* Joined */}
      <td className="px-4 py-4">
        <span className="text-xs text-slate-500 font-mono">{formatDate(user.created_at)}</span>
      </td>

      {/* Last Login */}
      <td className="px-4 py-4">
        <span className="text-xs text-slate-500 font-mono">{formatRelativeTime(user.last_login)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {user.status === 'suspended' ? (
            <button
              onClick={() => onReactivate(user)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm min-h-[36px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            >
              <span className="material-symbols-outlined text-sm">person_check</span>
              Reactivate
            </button>
          ) : user.role !== 'admin' ? (
            <button
              onClick={() => onSuspend(user)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm min-h-[36px] bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            >
              <span className="material-symbols-outlined text-sm">person_off</span>
              Suspend
            </button>
          ) : (
            <span className="text-xs text-slate-300">—</span>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// ─── User Mobile Card ────────────────────────────────────────────────────────

const UserMobileCard = ({ user, index, onSuspend, onReactivate, selected, onSelect, onViewDetail }) => {
  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.eaglet;
  const st = STATUS_CONFIG[user.status] || STATUS_CONFIG.inactive;
  const kyc = KYC_CONFIG[user.kyc_status] || KYC_CONFIG.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`rounded-xl p-4 flex flex-col gap-3 cursor-pointer border transition-all duration-200 ${
        selected
          ? 'bg-primary/5 border-primary/20'
          : 'bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-md'
      }`}
      onClick={() => onViewDetail(user)}
    >
      {/* Top row: checkbox + avatar/name + role */}
      <div className="flex items-center gap-3">
        <label
          className="flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(user.id)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
          />
        </label>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.full_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-200 ${role.bg} ${role.text}`}>
                {getInitials(user.full_name)}
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${st.dot}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || '—'}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{user.email}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider shrink-0 ${role.bg} ${role.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
          {role.label}
        </span>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-[56px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Status</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${st.bg} ${st.text}`}>
            {user.status === 'active' && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${st.dot}`} />}
            {st.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">KYC</span>
          <span className={`flex items-center gap-1 text-[11px] ${kyc.color}`}>
            <span className="material-symbols-outlined text-sm">{kyc.icon}</span>
            {kyc.label}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Joined</span>
          <p className="text-xs text-slate-500 font-mono">{formatDate(user.created_at)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Last Login</span>
          <p className="text-xs text-slate-500 font-mono">{formatRelativeTime(user.last_login)}</p>
        </div>
      </div>

      {/* Action button */}
      {user.role !== 'admin' && (
        <div className="pt-1 pl-[56px]" onClick={e => e.stopPropagation()}>
          {user.status === 'suspended' ? (
            <button
              onClick={() => onReactivate(user)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 min-h-[44px] bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <span className="material-symbols-outlined text-sm">person_check</span>
              Reactivate
            </button>
          ) : (
            <button
              onClick={() => onSuspend(user)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 min-h-[44px] bg-red-50 text-red-600 border border-red-200"
            >
              <span className="material-symbols-outlined text-sm">person_off</span>
              Suspend
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FilterBar = ({ filters, onChange, total, loading }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const roles    = [['all','All Roles'],['eagle','Eagle'],['eaglet','Eaglet']];
  const statuses = [['all','All'],['active','Active'],['suspended','Suspended'],['pending','Pending'],['inactive','Inactive']];

  const activeFilterCount = (filters.role !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0);

  const Pill = ({ value, label, field, current }) => (
    <button
      onClick={() => onChange({ ...filters, [field]: value, page: 1 })}
      className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] sm:min-h-0 ${
        current === value
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl p-4 bg-white/80 backdrop-blur-sm border border-slate-200/50">
      {/* Search + toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400">search</span>
          <input
            value={filters.search || ''}
            onChange={e => onChange({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none min-h-[44px] bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] shrink-0 border ${
            activeFilterCount > 0
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-base">tune</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop inline filters */}
        <div className="hidden md:flex items-center gap-1.5">
          {roles.map(([v, l]) => <Pill key={v} value={v} label={l} field="role" current={filters.role} />)}
        </div>
        <div className="hidden md:block w-px h-5 bg-slate-200" />
        <div className="hidden md:flex items-center gap-1.5">
          {statuses.map(([v, l]) => <Pill key={v} value={v} label={l} field="status" current={filters.status} />)}
        </div>

        <div className="hidden md:flex ml-auto items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-primary/30 border-t-transparent rounded-full animate-spin" />}
          {!loading && <span className="text-xs text-slate-400 font-mono">{total} users</span>}
        </div>
      </div>

      {/* Mobile expanded filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-2 font-bold text-slate-400">Role</p>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map(([v, l]) => <Pill key={v} value={v} label={l} field="role" current={filters.role} />)}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-2 font-bold text-slate-400">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map(([v, l]) => <Pill key={v} value={v} label={l} field="status" current={filters.status} />)}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {loading && <div className="w-4 h-4 border-2 border-primary/30 border-t-transparent rounded-full animate-spin" />}
                {!loading && <span className="text-xs text-slate-400 font-mono">{total} users</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const PaginationBtn = ({ p, activePage, onChange, children, disabled }) => (
  <button
    onClick={() => !disabled && onChange(p)}
    disabled={disabled}
    className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 ${
      p === activePage
        ? 'bg-primary/10 text-primary border border-primary/30'
        : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
    }`}
  >
    {children ?? p}
  </button>
);

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <PaginationBtn p={page - 1} activePage={page} onChange={onChange} disabled={page === 1}><span className="material-symbols-outlined text-base">chevron_left</span></PaginationBtn>
      {pages.map(p => <PaginationBtn key={p} p={p} activePage={page} onChange={onChange}>{p}</PaginationBtn>)}
      <PaginationBtn p={page + 1} activePage={page} onChange={onChange} disabled={page === totalPages}><span className="material-symbols-outlined text-base">chevron_right</span></PaginationBtn>
    </div>
  );
};

// ─── Sortable Table Header ───────────────────────────────────────────────────

const SortableHeader = ({ label, ordering, onSort }) => {
  const sortConfig = SORT_COLUMNS[label];
  if (!sortConfig) {
    return (
      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50/80">
        {label}
      </th>
    );
  }

  const isActive = ordering === sortConfig.asc || ordering === sortConfig.desc;
  const isDesc = ordering === sortConfig.desc;

  return (
    <th
      onClick={() => {
        if (!isActive) onSort(sortConfig.desc);
        else if (isDesc) onSort(sortConfig.asc);
        else onSort(sortConfig.desc);
      }}
      className={`px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold cursor-pointer select-none group bg-slate-50/80 transition-colors ${
        isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span
          className={`material-symbols-outlined transition-all text-sm ${isActive ? 'opacity-100 text-primary' : 'opacity-0'}`}
          style={{ transform: isDesc ? 'rotate(0deg)' : 'rotate(180deg)' }}
        >
          arrow_downward
        </span>
        {!isActive && (
          <span className="material-symbols-outlined opacity-0 group-hover:opacity-40 transition-opacity text-sm text-slate-400">
            unfold_more
          </span>
        )}
      </span>
    </th>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ role: 'all', status: 'all', search: '', ordering: '-created_at', page: 1, per_page: 15 });
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null); // C5: replace window.confirm
  const [searchDebounced, setSearchDebounced] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailUser, setDetailUser] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(filters.search), 380);
    return () => clearTimeout(t);
  }, [filters.search]);

  const queryParams = useMemo(() => ({
    ...filters,
    search: searchDebounced,
  }), [filters, searchDebounced]);

  // Fetch users list
  const { data: usersData, isLoading: usersLoading, isFetching } = useQuery({
    queryKey: ['admin-users', queryParams],
    queryFn: () => adminService.getUsers(queryParams),
    keepPreviousData: true,
  });

  // Fetch platform stats (for stat tiles + recent activity)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    staleTime: 60_000,
  });

  const allUsers = usersData?.data?.data?.users ?? usersData?.data?.users ?? [];
  const users = allUsers.filter(u => u.role !== 'admin');
  const pagination = usersData?.data?.data?.pagination ?? usersData?.data?.pagination ?? {};
  const stats = statsData?.data?.data ?? statsData?.data ?? {};

  // Clear selection when filters/page change — setState in effect is intentional here
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters.role, filters.status, filters.page, searchDebounced]);

  // Selection handlers
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const nonAdminUsers = users.filter(u => u.role !== 'admin');
    if (selectedIds.size === nonAdminUsers.length && nonAdminUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(nonAdminUsers.map(u => u.id)));
    }
  }, [users, selectedIds]);

  const allNonAdminSelected = useMemo(() => {
    const nonAdminUsers = users.filter(u => u.role !== 'admin');
    return nonAdminUsers.length > 0 && selectedIds.size === nonAdminUsers.length;
  }, [users, selectedIds]);

  // Suspend
  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }) => adminService.suspendUser(userId, reason),
    onSuccess: (_, { userName }) => {
      toast.success(`${userName} suspended.`);
      setSuspendTarget(null);
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Suspension failed.');
    },
  });

  // Reactivate
  const reactivateMutation = useMutation({
    mutationFn: (userId) => adminService.reactivateUser(userId),
    onSuccess: () => {
      toast.success('User reactivated.');
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Reactivation failed.');
    },
  });

  const handleSuspendConfirm = useCallback((reason) => {
    if (!suspendTarget) return;
    suspendMutation.mutate({ userId: suspendTarget.id, reason, userName: suspendTarget.full_name });
  }, [suspendTarget, suspendMutation]);

  const handleReactivate = useCallback((user) => {
    setConfirmConfig({
      title: 'Reactivate account?',
      message: `${user.full_name}'s account will be restored to active status.`,
      confirmLabel: 'Reactivate',
      variant: 'primary',
      onConfirm: () => reactivateMutation.mutate(user.id),
    });
  }, [reactivateMutation]);

  const handleSort = useCallback((ordering) => {
    setFilters(f => ({ ...f, ordering, page: 1 }));
  }, []);

  const handleBulkSuspend = useCallback(() => {
    const selectedUsers = users.filter(u => selectedIds.has(u.id));
    const names = selectedUsers.map(u => u.full_name).join(', ');
    setConfirmConfig({
      title: `Suspend ${selectedIds.size} user${selectedIds.size !== 1 ? 's' : ''}?`,
      message: names,
      confirmLabel: 'Suspend',
      variant: 'danger',
      onConfirm: () => setSuspendTarget(selectedUsers[0]),
    });
  }, [selectedIds, users]);

  return (
    <>
      <DashboardLayout variant="admin">
        <div className="flex flex-col gap-5 sm:gap-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Users Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Oversee every Eagle and Eaglet on the platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportUsersCSV(users)}
              disabled={users.length === 0}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-300 flex items-center gap-2 hover:shadow-md disabled:opacity-40 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
            <select
              value={filters.ordering}
              onChange={e => setFilters(f => ({ ...f, ordering: e.target.value, page: 1 }))}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-300 outline-none min-h-[44px] cursor-pointer"
            >
              <option value="-created_at">Newest first</option>
              <option value="created_at">Oldest first</option>
              <option value="first_name">Name A–Z</option>
              <option value="-first_name">Name Z–A</option>
              <option value="-last_login">Last active</option>
            </select>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon="group"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            label="Total Users"
            value={statsLoading ? '...' : (stats?.users?.total ?? 0).toLocaleString()}
            delay={0}
          />
          <StatCard
            icon="psychology"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            label="Eagles (Mentors)"
            value={statsLoading ? '...' : (stats?.users?.eagles ?? 0).toLocaleString()}
            delay={100}
          />
          <StatCard
            icon="school"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            label="Eaglets (Mentees)"
            value={statsLoading ? '...' : (stats?.users?.eaglets ?? 0).toLocaleString()}
            delay={200}
          />
          <StatCard
            icon="person_off"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            label="Suspended"
            value={statsLoading ? '...' : (stats?.users?.suspended ?? 0).toLocaleString()}
            delay={300}
          />
        </div>

        {/* ── Filters ── */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          total={pagination.total ?? 0}
          loading={isFetching}
        />

        {/* ── Users Table ── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-500">

            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="p-3 flex flex-col gap-3">
                <AnimatePresence mode="wait">
                  {usersLoading ? (
                    <motion.div key="mobile-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-xl p-4 animate-pulse bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200" />
                            <div className="flex-1">
                              <div className="h-3 rounded w-24 mb-1.5 bg-slate-200" />
                              <div className="h-2 rounded w-32 bg-slate-100" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : users.length === 0 ? (
                    <motion.div key="mobile-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl block mb-3 text-slate-300">manage_accounts</span>
                      <p className="text-sm text-slate-400">No users found matching your filters.</p>
                    </motion.div>
                  ) : (
                    <motion.div key="mobile-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                      {users.map((user, i) => (
                        <UserMobileCard
                          key={user.id}
                          user={user}
                          index={i}
                          onSuspend={setSuspendTarget}
                          onReactivate={handleReactivate}
                          selected={selectedIds.has(user.id)}
                          onSelect={toggleSelect}
                          onViewDetail={setDetailUser}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pl-4 pr-1 py-4 w-10 bg-slate-50/80">
                      <label className="flex items-center justify-center w-8 h-8 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allNonAdminSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                        />
                      </label>
                    </th>
                    {['User', 'Role', 'Status', 'KYC', 'Joined', 'Last Login', 'Actions'].map(h => (
                      <SortableHeader
                        key={h}
                        label={h}
                        ordering={filters.ordering}
                        onSort={handleSort}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    Array(8).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Array(8).fill(0).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div
                              className="h-3 rounded animate-pulse bg-slate-100"
                              style={{ width: j === 0 ? '20px' : j === 1 ? '140px' : j === 6 ? '60px' : '70px' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <span className="material-symbols-outlined text-4xl block mb-3 text-slate-300">manage_accounts</span>
                        <p className="text-sm text-slate-400">No users found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {users.map((user, i) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          index={i}
                          onSuspend={setSuspendTarget}
                          onReactivate={handleReactivate}
                          selected={selectedIds.has(user.id)}
                          onSelect={toggleSelect}
                          onViewDetail={setDetailUser}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100">
                <Pagination
                  page={filters.page}
                  totalPages={pagination.total_pages}
                  onChange={p => setFilters(f => ({ ...f, page: p }))}
                />
              </div>
            )}
          </div>


      </div>

      {/* Suspend modal */}
      <AnimatePresence>
        {suspendTarget && (
          <SuspendModal
            user={suspendTarget}
            onClose={() => setSuspendTarget(null)}
            onConfirm={handleSuspendConfirm}
            isLoading={suspendMutation.isLoading}
          />
        )}
      </AnimatePresence>

      {/* User detail slide-over */}
      <AnimatePresence>
        {detailUser && (
          <UserDetailPanel
            user={detailUser}
            onClose={() => setDetailUser(null)}
            onSuspend={setSuspendTarget}
            onReactivate={handleReactivate}
          />
        )}
      </AnimatePresence>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionBar
            count={selectedIds.size}
            onSuspendAll={handleBulkSuspend}
            onDeselectAll={() => setSelectedIds(new Set())}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>

    <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </>
  );
};

export default AdminUsersPage;