/**
 * AdminRoleRequestsPage (plan 18-04 revision).
 *
 * The EOI queue lived inside the KYC Portal as an outer tab until the
 * Admin Team consolidation. It now lives at /admin/team/requests under
 * the shared Team/Admin Requests tab strip.
 */

import DashboardLayout from '@shared/components/layout/DashboardLayout';
import SectionTabs from '@shared/components/layout/SectionTabs';
import AdminRequestsList from '@modules/admin-role/components/AdminRequestsList';
import { usePendingAdminRequests } from '@modules/admin-role/hooks/useAdminRole';

const TEAM_TABS_BASE = [
  { label: 'Team', to: '/admin/team' },
  { label: 'Admin Requests', to: '/admin/team/requests' },
];

export default function AdminRoleRequestsPage() {
  const { data: pending = [] } = usePendingAdminRequests('pending');
  const tabs = TEAM_TABS_BASE.map((t) =>
    t.to === '/admin/team/requests' ? { ...t, badge: pending.length } : t,
  );

  return (
    <DashboardLayout variant="admin">
      <div className="flex flex-col gap-6 min-h-full">
        {/* Sub-section tabs */}
        <SectionTabs tabs={tabs} />

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
              <span className="material-symbols-outlined text-white text-base">shield_person</span>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              Admin Team
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Admin role requests
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review mentor expressions of interest in joining the admin team.
          </p>
        </div>

        <AdminRequestsList />
      </div>
    </DashboardLayout>
  );
}
