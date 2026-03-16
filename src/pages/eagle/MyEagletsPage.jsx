import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useMyNests, useNestMembers } from '../../modules/nest/hooks/useNests';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Avatar gradient palette tied to name hash
const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-600',
];
const avatarGradient = (name = '') => {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * Animated background — matches eagle variant in DashboardLayout
 */
const PageBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    {/* Soft radial glow — primary */}
    <div
      className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.06]"
      style={{
        background: 'radial-gradient(circle, #1f3b61 0%, transparent 70%)',
        animation: 'float-slow 22s ease-in-out infinite',
      }}
    />
    {/* Warm gold glow — accent */}
    <div
      className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
      style={{
        background: 'radial-gradient(circle, #d97706 0%, transparent 70%)',
        animation: 'float-medium 18s ease-in-out infinite',
      }}
    />
    {/* Subtle dot-grid texture */}
    <div
      className="absolute inset-0 opacity-[0.018]"
      style={{
        backgroundImage:
          'radial-gradient(circle, #1f3b61 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    />
  </div>
);

/**
 * Top stat card
 */
const StatCard = ({ icon, iconBg, iconColor, label, value, delay = 0 }) => (
  <div
    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* shimmer */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
    <div className="flex items-center gap-4">
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
      >
        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  iconBg: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  delay: PropTypes.number,
};

/**
 * Progress bar
 */
const ProgressBar = ({ value = 0 }) => {
  const color =
    value >= 75
      ? 'bg-gradient-to-r from-primary to-blue-400'
      : value >= 40
      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
      : 'bg-gradient-to-r from-rose-400 to-pink-400';

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-[1400ms] ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-500 w-9 text-right tabular-nums">
        {value}%
      </span>
    </div>
  );
};

ProgressBar.propTypes = { value: PropTypes.number };

/**
 * Status badge
 */
const STATUS = {
  active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-400', label: 'Active' },
  inactive: { bg: 'bg-slate-100 text-slate-500 border-slate-200/60', dot: 'bg-slate-400', label: 'Inactive' },
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-400', label: 'Pending' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
};

StatusBadge.propTypes = { status: PropTypes.string };

/**
 * Action icon button
 */
const ActionBtn = ({ icon, title, onClick, className = '' }) => (
  <button
    title={title}
    onClick={onClick}
    className={`group/btn relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${className}`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
  </button>
);

ActionBtn.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

/**
 * Single eaglet row
 */
const EagletRow = ({ member, nestName, onViewProfile, onMessage, onManage, delay = 0 }) => {
  // Backend returns `user_details` from UserMinimalSerializer
  const user = member.user_details || member.user || member;
  const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Eaglet';
  const email = user.email || '';
  const avatar = user.avatar_url || user.profile_picture_url || user.profile_picture || user.avatar || null;
  const joinDate = member.joined_at || member.created_at || '';
  const points = member.total_points ?? member.points ?? 0;
  const progress = member.progress_percentage ?? member.progress ?? 0;
  const currentModule = member.current_module || 'Not started';
  const statusRaw = member.status || 'active';
  const status = statusRaw === 'approved' ? 'active' : statusRaw;

  return (
    <tr
      className="group/row border-b border-slate-100/80 hover:bg-gradient-to-r hover:from-primary/[0.03] hover:to-transparent transition-all duration-500 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Eaglet name + avatar */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3 transition-transform duration-500 ease-out group-hover/row:translate-x-1">
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white group-hover/row:ring-primary/20 transition-all duration-300"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(fullName)} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover/row:shadow-md transition-all duration-300`}
            >
              {getInitials(fullName)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-slate-900 group-hover/row:text-primary transition-colors duration-300 leading-tight">
              {fullName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{email || nestName}</p>
          </div>
        </div>
      </td>

      {/* Nest */}
      <td className="py-4 px-3 hidden lg:table-cell">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-medium">
          <span className="material-symbols-outlined text-[13px]">diversity_3</span>
          {nestName}
        </span>
      </td>

      {/* Date joined */}
      <td className="py-4 px-3 hidden md:table-cell">
        <p className="text-sm text-slate-600 tabular-nums">{fmtDate(joinDate)}</p>
      </td>

      {/* Total points */}
      <td className="py-4 px-3 hidden sm:table-cell">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-500 text-[16px]">stars</span>
          <span className="text-sm font-bold text-slate-800 tabular-nums">
            {typeof points === 'number' ? points.toLocaleString() : points}
          </span>
        </div>
      </td>

      {/* Current module + progress */}
      <td className="py-4 px-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-slate-700 font-medium leading-tight max-w-[140px] truncate">
            {currentModule}
          </p>
          <ProgressBar value={progress} />
        </div>
      </td>

      {/* Status */}
      <td className="py-4 px-3">
        <StatusBadge status={status} />
      </td>

      {/* Actions */}
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          <ActionBtn
            icon="visibility"
            title="View profile"
            onClick={() => onViewProfile(member)}
            className="text-slate-400 hover:text-primary hover:bg-primary/10"
          />
          <ActionBtn
            icon="chat"
            title="Send message"
            onClick={() => onMessage(member)}
            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          />
          <ActionBtn
            icon="manage_accounts"
            title="Manage eaglet"
            onClick={() => onManage(member)}
            className="text-slate-400 hover:text-amber-600 hover:bg-amber-50"
          />
        </div>
      </td>
    </tr>
  );
};

EagletRow.propTypes = {
  member: PropTypes.object.isRequired,
  nestName: PropTypes.string,
  onViewProfile: PropTypes.func,
  onMessage: PropTypes.func,
  onManage: PropTypes.func,
  delay: PropTypes.number,
};

/**
 * Empty state
 */
const EmptyState = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center mb-5 shadow-inner">
      <span className="material-symbols-outlined text-4xl text-primary/40">group_off</span>
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">
      {query ? `No results for "${query}"` : 'No eaglets yet'}
    </h3>
    <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
      {query
        ? 'Try a different name, email, or status filter.'
        : 'Eaglets who join your nests will appear here once approved.'}
    </p>
  </div>
);

EmptyState.propTypes = { query: PropTypes.string };

/**
 * Skeleton row for loading state
 */
const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="py-4 px-3">
        <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Hook: aggregate all eaglets across nests ─────────────────────────────────

/**
 * Fetches members for a single nest — renders nothing if nestId is falsy.
 */
const NestMembersLoader = ({ nestId, nestName, onLoaded }) => {
  const { data, isSuccess } = useNestMembers(nestId);
  useEffect(() => {
    if (isSuccess) {
      const members = data?.data?.results ?? data?.data ?? (Array.isArray(data) ? data : []);
      onLoaded(nestId, nestName, members);
    }
  }, [isSuccess, data, nestId, nestName, onLoaded]);
  return null;
};

NestMembersLoader.propTypes = {
  nestId: PropTypes.string.isRequired,
  nestName: PropTypes.string,
  onLoaded: PropTypes.func.isRequired,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;

const MyEagletsPage = () => {
  const navigate = useNavigate();

  // Fetch the mentor's nests
  const { data: nestsData, isLoading: nestsLoading } = useMyNests();
  const nests = useMemo(() => {
    const raw = nestsData?.data?.results ?? nestsData?.data ?? (Array.isArray(nestsData) ? nestsData : []);
    return raw;
  }, [nestsData]);

  // Accumulate members across all nests as they load
  const [membersMap, setMembersMap] = useState({});
  const handleLoaded = useCallback((nestId, nestName, members) => {
    setMembersMap((prev) => {
      if (prev[nestId]) return prev; // already loaded
      return { ...prev, [nestId]: { nestName, members } };
    });
  }, []);

  // Flatten all members with their nest context, de-dupe by user id
  const allEaglets = useMemo(() => {
    const seen = new Set();
    const flat = [];
    for (const [nestId, { nestName, members }] of Object.entries(membersMap)) {
      void nestId;
      for (const m of members) {
        const uid = m.user_details?.id || m.user?.id || m.id;
        if (!seen.has(uid)) {
          seen.add(uid);
          flat.push({ ...m, _nestName: nestName });
        }
      }
    }
    return flat;
  }, [membersMap]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nestFilter, setNestFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEaglets.filter((m) => {
      const user = m.user_details || m.user || m;
      const name = (user.full_name || `${user.first_name || ''} ${user.last_name || ''}`).toLowerCase();
      const email = (user.email || '').toLowerCase();
      const status = m.status === 'approved' ? 'active' : m.status || 'active';
      if (q && !name.includes(q) && !email.includes(q)) return false;
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (nestFilter !== 'all' && m._nestName !== nestFilter) return false;
      return true;
    });
  }, [allEaglets, search, statusFilter, nestFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Stats
  const totalEaglets = allEaglets.length;
  const activeCount = allEaglets.filter(
    (m) => (m.status === 'active' || m.status === 'approved')
  ).length;
  const avgProgress = totalEaglets
    ? Math.round(allEaglets.reduce((sum, m) => sum + (m.progress ?? 0), 0) / totalEaglets)
    : 0;

  const isLoading = nestsLoading || (nests.length > 0 && Object.keys(membersMap).length < nests.length);

  // Actions
  const handleViewProfile = useCallback((member) => {
    const uid = member.user_details?.id || member.user?.id || member.id;
    if (uid) navigate(`/eagle/eaglets/${uid}`);
  }, [navigate]);

  const handleMessage = useCallback((member) => {
    navigate('/eagle/messages');
  }, [navigate]);

  const handleManage = useCallback((member) => {
    const nestId = member.nest || member.nest_id;
    if (nestId) navigate(`/eagle/nests/${nestId}`);
  }, [navigate]);

  const nestNames = useMemo(
    () => [...new Set(Object.values(membersMap).map((v) => v.nestName).filter(Boolean))],
    [membersMap]
  );

  return (
    <DashboardLayout variant="eagle">
      {/* Load members for each nest (side-effect loaders) */}
      {nests.map((nest) => (
        <NestMembersLoader
          key={nest.id}
          nestId={nest.id}
          nestName={nest.name || nest.title || 'My Nest'}
          onLoaded={handleLoaded}
        />
      ))}

      <PageBackground />

      <div className="space-y-7 animate-fade-in-up pb-8">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-blue-400" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                My Eaglets
              </h1>
            </div>
            <p className="text-slate-500 text-sm pl-3">
              Manage and monitor the progress of your mentees across all Nests.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/eagle/nests"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-rotate-12">
                diversity_3
              </span>
              Manage Nests
            </Link>
            <Link
              to="/eagle/messages"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-12">
                send
              </span>
              Broadcast Message
            </Link>
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon="group"
            iconBg="bg-blue-50"
            iconColor="text-primary"
            label="Total Eaglets"
            value={isLoading ? '…' : totalEaglets}
            delay={0}
          />
          <StatCard
            icon="trending_up"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            label="Avg. Progress"
            value={isLoading ? '…' : `${avgProgress}%`}
            delay={80}
          />
          <StatCard
            icon="bolt"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            label="Active Eaglets"
            value={isLoading ? '…' : activeCount}
            delay={160}
          />
        </div>

        {/* ── Table Card ───────────────────────────────────────────── */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email…"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200/70 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200/70 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDdMMTEgMSIgc3Ryb2tlPSIjOTRBM0I4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_12px_center]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Nest filter */}
            <select
              value={nestFilter}
              onChange={(e) => { setNestFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200/70 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDdMMTEgMSIgc3Ryb2tlPSIjOTRBM0I4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_12px_center]"
            >
              <option value="all">All Nests</option>
              {nestNames.map((n, idx) => (
                <option key={`${n}-${idx}`} value={n}>{n}</option>
              ))}
            </select>

            {/* Result count pill */}
            {!isLoading && (
              <div className="hidden sm:flex items-center px-3 rounded-xl bg-primary/5 border border-primary/10 text-xs font-semibold text-primary whitespace-nowrap self-center">
                {filtered.length} {filtered.length === 1 ? 'eaglet' : 'eaglets'}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Eaglet
                  </th>
                  <th className="py-3 px-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                    Nest
                  </th>
                  <th className="py-3 px-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">
                    Joined
                  </th>
                  <th className="py-3 px-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                    Points
                  </th>
                  <th className="py-3 px-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Module / Progress
                  </th>
                  <th className="py-3 px-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState query={search} />
                    </td>
                  </tr>
                ) : (
                  paginated.map((member, i) => (
                    <EagletRow
                      key={member.user?.id || member.id || i}
                      member={member}
                      nestName={member._nestName || 'My Nest'}
                      onViewProfile={handleViewProfile}
                      onMessage={handleMessage}
                      onManage={handleManage}
                      delay={i * 40}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
              <p className="text-xs text-slate-400">
                Showing{' '}
                <span className="font-semibold text-slate-600">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-600">{filtered.length}</span> eaglets
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  // Show first, last, current ±1, with ellipsis
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          p === page
                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return (
                      <span key={p} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">
                        …
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick-access: Nest Cards ─────────────────────────────── */}
        {nests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">diversity_3</span>
                Your Nests
              </h2>
              <Link
                to="/eagle/nests"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                View all
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nests.slice(0, 6).map((nest, i) => {
                const nestData = membersMap[nest.id];
                const memberCount = nestData?.members?.length ?? nest.member_count ?? '…';
                return (
                  <Link
                    key={nest.id}
                    to={`/eagle/nests/${nest.id}`}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-400 shadow-sm"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 transition-all duration-400">
                      <span className="material-symbols-outlined text-primary text-xl">nest_eco_leaf</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate group-hover:text-primary transition-colors duration-300">
                        {nest.name || nest.title || `Nest ${i + 1}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {memberCount} {memberCount === 1 ? 'eaglet' : 'eaglets'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 text-[18px]">
                      arrow_forward_ios
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── No nests fallback ────────────────────────────────────── */}
        {!nestsLoading && nests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-primary/40">nest_eco_leaf</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Nests created yet</h3>
            <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
              Create your first Nest to start onboarding eaglets and tracking their growth.
            </p>
            <Link
              to="/eagle/nests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create a Nest
            </Link>
          </div>
        )}
      </div>

      {/* Page-scoped animation keyframes */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -40px) scale(1.05); }
          66% { transform: translate(-30px, 20px) scale(0.97); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -25px) scale(1.03); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default MyEagletsPage;
