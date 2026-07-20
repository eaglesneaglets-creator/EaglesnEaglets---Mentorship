import { useState, useMemo } from 'react';
import DashboardLayout from '@shared/components/layout/DashboardLayout';
import { useAdminNests } from '../../modules/admin-nest/hooks/useAdminNests';
import NestCard from '../../modules/admin-nest/components/NestCard';
import CreateNestModal from '../../modules/admin-nest/components/CreateNestModal';
import { CATEGORY_OPTIONS } from '../../modules/admin-nest/components/nestMeta';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'forming', label: 'Forming' },
  { value: 'archived', label: 'Archived' },
];

const selectClass =
  'h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer';

const AdminNestsPage = () => {
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const filters = useMemo(
    () => ({ status, category, search: search || undefined, page }),
    [status, category, search, page],
  );

  const { data, isLoading, isError } = useAdminNests(filters);
  const nests = data?.results ?? (Array.isArray(data) ? data : []);
  const totalCount = data?.count ?? nests.length;
  const hasNext = Boolean(data?.next);
  const hasPrev = Boolean(data?.previous);

  const resetPageAnd = (fn) => (val) => { setPage(1); fn(val); };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nests Community</h1>
            <p className="text-slate-500 text-sm mt-1">Overview of all active mentorship groups.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Nest
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
              placeholder="Search nests or mentors…"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select value={status} onChange={(e) => resetPageAnd(setStatus)(e.target.value)} className={selectClass} aria-label="Filter by status">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={category} onChange={(e) => resetPageAnd(setCategory)(e.target.value)} className={selectClass} aria-label="Filter by category">
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
                className={`w-9 h-10 flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="List view"
                aria-pressed={view === 'list'}
                className={`w-9 h-10 flex items-center justify-center transition-colors ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-3'}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={view === 'grid' ? 'h-72 bg-slate-100 rounded-2xl animate-pulse' : 'h-20 bg-slate-100 rounded-xl animate-pulse'} />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-red-700">Couldn&apos;t load nests. Please retry.</p>
          </div>
        ) : nests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">diversity_3</span>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No nests found</h3>
            <p className="text-sm text-slate-400 max-w-xs">Try a different filter, or create the first nest.</p>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-3'}>
            {nests.map((nest) => (
              <NestCard key={nest.id} nest={nest} variant={view} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && nests.length > 0 && (hasNext || hasPrev) && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-sm text-slate-500">Page {page} · {totalCount} nests</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      <CreateNestModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </DashboardLayout>
  );
};

export default AdminNestsPage;
