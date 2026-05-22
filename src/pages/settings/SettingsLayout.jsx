import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { sectionsForRole } from './config/settingsNav';

export default function SettingsLayout() {
  const { user } = useAuthStore();
  const role = user?.role;
  const sections = role ? sectionsForRole(role) : [];
  const variant = role === 'admin' ? 'admin' : role === 'eagle' ? 'eagle' : role === 'eaglet' ? 'eaglet' : 'default';

  const navigate = useNavigate();
  const location = useLocation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const activeSection = sections.find((s) => location.pathname.endsWith(`/${s.path}`)) || sections[0];

  useEffect(() => {
    if (!pickerOpen) return;
    const onClickAway = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, [pickerOpen]);

  const handlePick = (section) => {
    setPickerOpen(false);
    navigate(`/settings/${section.path}`);
  };

  return (
    <DashboardLayout variant={variant}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, preferences, and platform configuration.</p>
        </div>

        {/* Mobile section picker (custom dropdown — viewport-safe, SPA-navigation) */}
        <div className="lg:hidden relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center justify-between gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
              {activeSection && (
                <span className="material-symbols-outlined text-lg text-slate-500">{activeSection.icon}</span>
              )}
              <span className="truncate">{activeSection?.label || 'Choose a section…'}</span>
            </span>
            <span className={`material-symbols-outlined text-lg text-slate-400 transition-transform ${pickerOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {pickerOpen && (
            <div
              role="listbox"
              className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[60vh] overflow-y-auto"
            >
              {sections.map((section) => {
                const isActive = section.id === activeSection?.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handlePick(section)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{section.icon}</span>
                    <span className="flex-1 truncate">{section.label}</span>
                    {isActive && (
                      <span className="material-symbols-outlined text-base text-primary">check</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Desktop section nav */}
          <nav className="hidden lg:flex flex-col gap-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/70 p-3 h-fit sticky top-0">
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
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 p-4 sm:p-6 lg:p-8 min-h-[400px]">
            <Outlet />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
