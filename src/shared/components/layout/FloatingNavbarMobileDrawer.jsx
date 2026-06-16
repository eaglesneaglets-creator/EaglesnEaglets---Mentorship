import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDashboardPath,
  getInitials,
  isNavLinkActive,
  logoImg,
} from './publicNavConfig';
import { MOBILE_NAV_DRAWER_ID } from './FloatingNavbarMenuButton';

function MobileNavLink({ link, active, onNavigate, showChevron }) {
  const icon = link.icon || 'chevron_right';

  return (
    <Link
      to={link.path}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 min-h-12 px-3 rounded-xl text-[15px] font-semibold transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span
        className={`material-symbols-outlined text-[22px] ${
          active ? 'text-primary' : 'text-slate-400'
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1">{link.label}</span>
      {link.badge != null && link.badge > 0 && (
        <span className="min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold bg-primary text-white rounded-full flex items-center justify-center">
          {link.badge > 9 ? '9+' : link.badge}
        </span>
      )}
      {showChevron && !active && (
        <span className="material-symbols-outlined text-lg text-slate-300" aria-hidden>
          chevron_right
        </span>
      )}
    </Link>
  );
}

MobileNavLink.propTypes = {
  link: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.string,
    badge: PropTypes.number,
  }).isRequired,
  active: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
  showChevron: PropTypes.bool,
};

export default function FloatingNavbarMobileDrawer({
  mobileOpen,
  setMobileOpen,
  links,
  isAuthenticated,
  user,
  onLogout,
  dashboardLabel,
  authenticatedExtras = [],
}) {
  const location = useLocation();
  const closeButtonRef = useRef(null);
  const wasOpenRef = useRef(false);
  const [openSection, setOpenSection] = useState(null);

  const close = () => setMobileOpen(false);

  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;
      const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [mobileOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop — tap outside to dismiss (Airbnb / Stripe pattern). */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-slate-900/55 backdrop-blur-[2px] md:hidden"
            aria-label="Close navigation menu"
            onClick={close}
          />

          {/* Right slide-over panel — standard mobile web app pattern. */}
          <motion.aside
            id={MOBILE_NAV_DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            className="fixed top-0 right-0 z-[70] flex h-[100dvh] w-[min(100vw,21rem)] flex-col bg-white shadow-2xl md:hidden"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
              <Link to="/" onClick={close} className="flex min-w-0 items-center gap-2.5">
                <img
                  src={logoImg}
                  alt=""
                  className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">Eagles & Eaglets</p>
                  <p className="text-[11px] font-medium text-slate-500">Community mentorship</p>
                </div>
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Close navigation menu"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Primary navigation */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-label="Primary">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Explore
              </p>
              <ul className="space-y-1">
                {links.map((link) => {
                  const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                  const active = isNavLinkActive(location.pathname, link.path);
                  const sectionOpen = openSection === link.label;

                  if (!hasChildren) {
                    return (
                      <li key={`${link.path}-${link.label}`}>
                        <MobileNavLink
                          link={link}
                          active={active}
                          onNavigate={close}
                          showChevron={false}
                        />
                      </li>
                    );
                  }

                  return (
                    <li key={`${link.path}-${link.label}`} className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSection(prev => (prev === link.label ? null : link.label))
                        }
                        className={`flex w-full items-center gap-3 min-h-12 px-3 rounded-xl text-[15px] font-semibold transition-colors text-left ${
                          sectionOpen || active
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        aria-expanded={sectionOpen}
                      >
                        <span
                          className={`material-symbols-outlined text-[22px] flex-shrink-0 ${
                            sectionOpen || active ? 'text-primary' : 'text-slate-400'
                          }`}
                          aria-hidden
                        >
                          {link.icon || 'folder'}
                        </span>
                        <span className="flex-1">{link.label}</span>
                        <span
                          className={`material-symbols-outlined text-lg transition-transform duration-200 ${
                            sectionOpen ? 'rotate-90' : ''
                          } ${sectionOpen || active ? 'text-primary' : 'text-slate-400'}`}
                          aria-hidden
                        >
                          chevron_right
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {sectionOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                            className="ml-9 space-y-0.5 border-l border-slate-100 pl-2.5"
                          >
                            {link.children.map((child) => (
                              <li key={`${child.path}-${child.label}`}>
                                <MobileNavLink
                                  link={child}
                                  active={isNavLinkActive(location.pathname, child.path)}
                                  onNavigate={close}
                                  showChevron={false}
                                />
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Account / auth footer — sticky CTA zone (Duolingo / LinkedIn pattern). */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {getInitials(user)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to={getDashboardPath(user)}
                    onClick={close}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary-dark"
                  >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    {dashboardLabel}
                  </Link>

                  {authenticatedExtras.length > 0 && (
                    <ul className="space-y-1">
                      {authenticatedExtras.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.path}
                            onClick={close}
                            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
                          >
                            {link.icon && (
                              <span className={`material-symbols-outlined text-xl ${link.iconClass || 'text-primary'}`}>
                                {link.icon}
                              </span>
                            )}
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/register"
                    onClick={close}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/25 transition-colors hover:bg-primary-dark"
                  >
                    Join Now — It&apos;s Free
                  </Link>
                  <Link
                    to="/login"
                    onClick={close}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

FloatingNavbarMobileDrawer.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string,
      badge: PropTypes.number,
    }),
  ).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  dashboardLabel: PropTypes.string.isRequired,
  authenticatedExtras: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string,
      iconClass: PropTypes.string,
    }),
  ),
};
