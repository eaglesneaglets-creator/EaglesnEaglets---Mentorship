import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { sectionsForRole } from './config/settingsNav';

export default function SettingsLayout() {
  const { user } = useAuthStore();
  const role = user?.role;
  const sections = role ? sectionsForRole(role) : [];
  const variant = role === 'admin' ? 'admin' : role === 'eagle' ? 'eagle' : role === 'eaglet' ? 'eaglet' : 'default';

  return (
    <DashboardLayout variant={variant}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, preferences, and platform configuration.</p>
        </div>

        {/* Mobile section dropdown */}
        <div className="lg:hidden">
          <label htmlFor="settings-section" className="sr-only">Section</label>
          <select
            id="settings-section"
            className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/20"
            onChange={(e) => { window.location.assign(`/settings/${e.target.value}`); }}
            defaultValue=""
          >
            <option value="" disabled>Choose a section…</option>
            {sections.map((s) => (
              <option key={s.id} value={s.path}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Desktop section nav */}
          <nav className="hidden lg:flex flex-col gap-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 p-3 h-fit sticky top-20">
            {sections.map((section) => (
              <NavLink
                key={section.id}
                to={section.path}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">{section.icon}</span>
                <span className="flex-1">{section.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Section outlet */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 p-6 lg:p-8 min-h-[400px]">
            <Outlet />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
