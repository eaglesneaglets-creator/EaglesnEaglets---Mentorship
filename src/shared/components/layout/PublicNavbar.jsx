/**
 * PublicNavbar
 *
 * Shared floating navbar for all public-facing pages (HomePage, DonationsPage, etc.)
 * Auth-aware: shows user avatar + dropdown when logged in, Login/Join when not.
 *
 * Mobile: full-width top bar + right slide-over drawer (industry-standard pattern).
 * Desktop: centered floating pill (unchanged).
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@store';
import {
  PUBLIC_NAV_LINKS,
  navDividerClass,
  navMobileShellClass,
  navPillClass,
  navShellOffsetClass,
} from './publicNavConfig';
import {
  FloatingNavbarAuthDropdown,
  FloatingNavbarBrand,
  FloatingNavbarGuestAuth,
  FloatingNavbarLinks,
  FloatingNavbarUserAvatar,
} from './FloatingNavbarAuth';
import FloatingNavbarMobileDrawer from './FloatingNavbarMobileDrawer';
import FloatingNavbarMenuButton from './FloatingNavbarMenuButton';
import {
  useFloatingNavbarState,
  useNavbarScrollThreshold,
} from './useFloatingNavbarState';

const PUBLIC_AUTH_MENU_LINKS = [
  { to: '/store', label: 'Store', icon: 'storefront' },
  { to: '/donations/my-donations', label: 'My Donations', icon: 'volunteer_activism' },
];

const PUBLIC_MOBILE_AUTH_EXTRAS = [
  { label: 'My Donations', path: '/donations/my-donations', icon: 'volunteer_activism' },
];

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const scrolled = useNavbarScrollThreshold();
  const {
    mobileOpen,
    setMobileOpen,
    toggleMobile,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleLogout,
  } = useFloatingNavbarState({ logout, navigate });

  const isHome = location.pathname === '/';
  const useDarkText = scrolled || !isHome;

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 max-md:left-0 max-md:translate-x-0 max-md:w-full ${navShellOffsetClass(useDarkText)}`}
      >
        {/* Desktop — floating pill */}
        <div className={navPillClass(useDarkText)}>
          <FloatingNavbarBrand useDarkText={useDarkText} />
          <div className={navDividerClass(useDarkText, { wide: true })} />
          <FloatingNavbarLinks links={PUBLIC_NAV_LINKS} useDarkText={useDarkText} />
          <div className={navDividerClass(useDarkText, { wide: true })} />

          {isAuthenticated && user ? (
            <FloatingNavbarAuthDropdown
              user={user}
              useDarkText={useDarkText}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              dropdownRef={dropdownRef}
              onLogout={handleLogout}
              dashboardLabel="Go to Dashboard"
              menuLinks={PUBLIC_AUTH_MENU_LINKS}
            />
          ) : (
            <FloatingNavbarGuestAuth useDarkText={useDarkText} />
          )}
        </div>
      </motion.nav>

      {/* Mobile — full-width top bar (separate fixed layer for correct edge-to-edge layout) */}
      <div className={navMobileShellClass(useDarkText)}>
        <div className={navPillClass(useDarkText, { mobile: true })}>
          <FloatingNavbarBrand useDarkText={useDarkText} compact />
          <div className="flex flex-shrink-0 items-center gap-2">
            {isAuthenticated && user && (
              <FloatingNavbarUserAvatar user={user} size="sm" />
            )}
            <FloatingNavbarMenuButton
              mobileOpen={mobileOpen}
              onToggle={toggleMobile}
              useDarkText={useDarkText}
            />
          </div>
        </div>
      </div>

      <FloatingNavbarMobileDrawer
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        links={PUBLIC_NAV_LINKS}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        dashboardLabel="Go to Dashboard"
        authenticatedExtras={PUBLIC_MOBILE_AUTH_EXTRAS}
      />
    </>
  );
}
