/**
 * StoreHeader
 *
 * Floating pill navbar for the Store pages — same visual language as PublicNavbar
 * but with store-specific icons (cart badge + orders).
 */

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAuthStore } from '@store';
import { useCartCount } from '../hooks/useCart';
import {
  PUBLIC_NAV_LINKS,
  getStoreMobileNavLinks,
  navDividerClass,
  navIconBtnClass,
  navMobileShellClass,
  navPillClass,
  navShellOffsetClass,
} from '../../../shared/components/layout/publicNavConfig';
import {
  FloatingNavbarAuthDropdown,
  FloatingNavbarBrand,
  FloatingNavbarGuestAuth,
  FloatingNavbarLinks,
} from '../../../shared/components/layout/FloatingNavbarAuth';
import FloatingNavbarMobileDrawer from '../../../shared/components/layout/FloatingNavbarMobileDrawer';
import FloatingNavbarMenuButton from '../../../shared/components/layout/FloatingNavbarMenuButton';
import {
  useFloatingNavbarState,
  useNavbarScrollThreshold,
} from '../../../shared/components/layout/useFloatingNavbarState';

function StoreActionIcons({ useDarkText, cartCount }) {
  const iconBtnClass = navIconBtnClass(useDarkText);

  return (
    <>
      <Link
        to="/store/orders"
        className={iconBtnClass}
        aria-label="My orders"
        title="My Orders"
      >
        <span className="material-symbols-outlined text-xl">receipt_long</span>
      </Link>
      <Link
        to="/store/cart"
        className={`${iconBtnClass} flex items-center`}
        aria-label="View cart"
        title="Cart"
      >
        <span className="material-symbols-outlined text-xl">shopping_cart</span>
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center px-0.5">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </Link>
    </>
  );
}

StoreActionIcons.propTypes = {
  useDarkText: PropTypes.bool.isRequired,
  cartCount: PropTypes.number.isRequired,
};

export default function StoreHeader({ forceScrolled = false }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const scrolledFromWindow = useNavbarScrollThreshold();
  const useDarkText = forceScrolled || scrolledFromWindow;
  const authCartCount = useCartCount();
  const cartCount = isAuthenticated ? authCartCount : 0;

  const {
    mobileOpen,
    setMobileOpen,
    toggleMobile,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleLogout,
  } = useFloatingNavbarState({ logout, navigate });

  const storeAuthMenuLinks = [
    { to: '/store/orders', label: 'My Orders', icon: 'receipt_long' },
    {
      to: '/store/cart',
      label: 'My Cart',
      icon: 'shopping_bag',
      badge: cartCount,
    },
  ];

  const mobileLinks = useMemo(
    () => getStoreMobileNavLinks(cartCount),
    [cartCount],
  );

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 max-md:left-0 max-md:translate-x-0 max-md:w-full ${navShellOffsetClass(useDarkText)}`}
      >
        <div className={navPillClass(useDarkText)}>
        <FloatingNavbarBrand useDarkText={useDarkText} />
        <div className={navDividerClass(useDarkText)} />
        <FloatingNavbarLinks links={PUBLIC_NAV_LINKS} useDarkText={useDarkText} />
        <div className={navDividerClass(useDarkText)} />
        <StoreActionIcons useDarkText={useDarkText} cartCount={cartCount} />
        <div className={navDividerClass(useDarkText)} />

        {isAuthenticated && user ? (
          <FloatingNavbarAuthDropdown
            user={user}
            useDarkText={useDarkText}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownRef={dropdownRef}
            onLogout={handleLogout}
            dashboardLabel="Back to Dashboard"
            menuLinks={storeAuthMenuLinks}
          />
        ) : (
          <FloatingNavbarGuestAuth useDarkText={useDarkText} />
        )}
      </div>
      </motion.nav>

      <div className={navMobileShellClass(useDarkText)}>
        <div className={navPillClass(useDarkText, { mobile: true })}>
          <FloatingNavbarBrand useDarkText={useDarkText} compact />
          <div className="flex flex-shrink-0 items-center gap-1">
            <Link
              to="/store/cart"
              className={`${navIconBtnClass(useDarkText)} relative`}
              aria-label="Cart"
              title="Cart"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
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
        links={mobileLinks}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        dashboardLabel="Back to Dashboard"
      />
    </>
  );
}

StoreHeader.propTypes = {
  forceScrolled: PropTypes.bool,
};
