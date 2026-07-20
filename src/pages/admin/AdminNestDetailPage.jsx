import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '@shared/components/layout/DashboardLayout';
import { ConfirmModal } from '@shared/components/ui/ConfirmModal';
import {
  useAdminNest,
  useAdminNestActivity,
  useArchiveNest,
} from '../../modules/admin-nest/hooks/useAdminNests';
import NestMembersPanel from '../../modules/admin-nest/components/NestMembersPanel';
import NestActivityTimeline from '../../modules/admin-nest/components/NestActivityTimeline';
import { categoryMeta, statusMeta } from '../../modules/admin-nest/components/nestMeta';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'info' },
  { id: 'members', label: 'Members', icon: 'group' },
  { id: 'activity', label: 'Activity', icon: 'history' },
  { id: 'content', label: 'Shared Content', icon: 'folder' },
];

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const AdminNestDetailPage = () => {
  const { nestId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const { data: nest, isLoading, isError } = useAdminNest(nestId);
  const { data: activityData, isLoading: activityLoading } = useAdminNestActivity(
    nestId,
    { enabled: tab === 'activity' },
  );
  const archiveMutation = useArchiveNest();

  if (isLoading) {
    return (
      <DashboardLayout variant="admin">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !nest) {
    return (
      <DashboardLayout variant="admin">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-red-700">Nest not found.</p>
          <Link to="/admin/nests" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">← Back to Nests</Link>
        </div>
      </DashboardLayout>
    );
  }

  const cat = categoryMeta(nest.category);
  const st = statusMeta(nest.status);
  const eagleName = nest.eagle?.full_name || `${nest.eagle?.first_name || ''} ${nest.eagle?.last_name || ''}`.trim();
  const activity = activityData?.results ?? [];

  const handleArchive = () => {
    setMenuOpen(false);
    setConfirm({
      title: 'Archive nest?',
      message: `Archive "${nest.name}"? Members lose access and it moves to the archived list. This can be reversed by a superadmin.`,
      confirmLabel: 'Archive',
      variant: 'danger',
      onConfirm: () =>
        archiveMutation.mutate(nestId, { onSuccess: () => navigate('/admin/nests') }),
    });
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6 pb-8">
        {/* Breadcrumb + header */}
        <div>
          <Link to="/admin/nests" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors mb-3">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Nests
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0`}>
                <span className="material-symbols-outlined text-white">{cat.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  Nest: {nest.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  <span className="text-xs text-slate-400">{cat.label}</span>
                </div>
              </div>
            </div>

            {/* Overflow menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Nest actions"
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden">
                    <button
                      type="button"
                      onClick={handleArchive}
                      disabled={nest.status === 'archived'}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">archive</span>
                      Archive Nest
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${active ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                {t.label}
                {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-2">About</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{nest.description || 'No description.'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Eagle</span>
                <span className="font-semibold text-slate-700">{eagleName || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Members</span>
                <span className="font-semibold text-slate-700 tabular-nums">{nest.member_count || 0} / {nest.max_members}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Privacy</span>
                <span className="font-semibold text-slate-700 capitalize">{nest.privacy?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Created</span>
                <span className="font-semibold text-slate-700">{fmtDate(nest.created_at)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <NestMembersPanel nestId={nestId} ownerId={nest.eagle?.id} members={nest.members || []} />
        )}

        {tab === 'activity' && (
          <div className="bg-slate-50/50 rounded-2xl p-5">
            <h3 className="font-bold text-slate-900 mb-4">Nest Activity Log</h3>
            <NestActivityTimeline items={activity} isLoading={activityLoading} />
          </div>
        )}

        {tab === 'content' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Shared Content</h3>
            {(nest.shared_content || []).length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No content shared yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {nest.shared_content.map((c) => (
                  <a
                    key={c.id}
                    href={c.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400">description</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {c.uploaded_by?.full_name || 'Unknown'} · {fmtDate(c.created_at)}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">open_in_new</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
    </DashboardLayout>
  );
};

export default AdminNestDetailPage;
