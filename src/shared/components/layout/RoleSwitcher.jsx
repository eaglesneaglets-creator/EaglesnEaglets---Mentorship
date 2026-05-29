/**
 * RoleSwitcher — Notion-style profile-pill dropdown (plan 18-03).
 *
 * Renders inside the sidebar profile pill. For stacked-admin users (mentor
 * with platform-admin privileges) the chevron becomes interactive and opens
 * a dropdown letting them flip between mentor and admin contexts. For
 * single-role users the component is hidden (DashboardLayout renders the
 * existing static pill).
 *
 * UX vocabulary borrowed from:
 *   - Notion: sidebar location + account actions in same menu
 *   - Vercel: colored role badge per option
 *   - GitHub: checkmark on current
 *   - Linear: per-item subtitle preview
 */

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useCurrentMode, useSetCurrentMode } from '@store';

const MODES = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Manage platform & members',
    icon: 'shield_person',
    home: '/admin/dashboard',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Lead your Nest',
    icon: 'workspaces',
    home: '/dashboard',
  },
];

export default function RoleSwitcher({
  user,
  onClose,
  onLogout,
  variant = 'expanded', // 'expanded' (sidebar) | 'collapsed' (icon-only sidebar)
}) {
  const navigate = useNavigate();
  const currentMode = useCurrentMode();
  const setCurrentMode = useSetCurrentMode();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handlePick = (mode) => {
    setOpen(false);
    if (mode.value !== currentMode) setCurrentMode(mode.value);
    navigate(mode.home);
    onClose?.();
  };

  const handleSettings = () => {
    setOpen(false);
    navigate('/settings/account');
    onClose?.();
  };

  const handleLogoutClick = () => {
    setOpen(false);
    onLogout?.();
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`
    .toUpperCase() || '?';

  const currentLabel =
    currentMode === 'admin' ? 'Administrator' : 'Mentor';
  const badgeBg =
    currentMode === 'admin'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  // Anchor + trigger (collapsed = icon button only)
  if (variant === 'collapsed') {
    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-sm shadow-lg hover:scale-105 transition-transform"
        >
          {initials}
        </button>
        {open && (
          <DropdownMenu
            position="collapsed"
            currentMode={currentMode}
            onPick={handlePick}
            onSettings={handleSettings}
            onLogout={handleLogoutClick}
          />
        )}
      </div>
    );
  }

  // Expanded variant — full pill button
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${
          open ? 'bg-slate-100' : 'bg-slate-50/80 hover:bg-slate-100'
        }`}
      >
        <div className="relative flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.first_name}
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <span
            className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeBg}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentMode === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            {currentLabel}
          </span>
        </div>
        <span
          className={`material-symbols-outlined text-slate-400 text-lg transition-transform flex-shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <DropdownMenu
          position="expanded"
          currentMode={currentMode}
          onPick={handlePick}
          onSettings={handleSettings}
          onLogout={handleLogoutClick}
        />
      )}
    </div>
  );
}

RoleSwitcher.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func,
  onLogout: PropTypes.func,
  variant: PropTypes.oneOf(['expanded', 'collapsed']),
};

function DropdownMenu({ position, currentMode, onPick, onSettings, onLogout }) {
  // Expanded: anchored beneath the pill, full width.
  // Collapsed: floats to the right of the icon at top.
  const positionClass =
    position === 'collapsed'
      ? 'left-full ml-2 top-0 w-64'
      : 'left-0 right-0 mt-2 w-auto';

  return (
    <div
      role="menu"
      className={`absolute z-50 ${positionClass} bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden`}
    >
      <p className="px-4 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Switch role
      </p>
      <div className="px-2 pb-2 space-y-1">
        {MODES.map((mode) => {
          const isCurrent = mode.value === currentMode;
          return (
            <button
              key={mode.value}
              type="button"
              role="menuitem"
              onClick={() => onPick(mode)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                isCurrent
                  ? mode.value === 'admin'
                    ? 'bg-amber-50/80'
                    : 'bg-emerald-50/80'
                  : 'hover:bg-slate-50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg mt-0.5 ${
                  mode.value === 'admin' ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {mode.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {mode.label}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  {mode.description}
                </p>
              </div>
              {isCurrent && (
                <span className="material-symbols-outlined text-emerald-600 text-base mt-0.5">
                  check
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="border-t border-slate-100 px-2 py-2 space-y-1">
        <button
          type="button"
          role="menuitem"
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-slate-500">
            settings
          </span>
          Account settings
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Log out
        </button>
      </div>
    </div>
  );
}

DropdownMenu.propTypes = {
  position: PropTypes.oneOf(['expanded', 'collapsed']).isRequired,
  currentMode: PropTypes.string,
  onPick: PropTypes.func.isRequired,
  onSettings: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
