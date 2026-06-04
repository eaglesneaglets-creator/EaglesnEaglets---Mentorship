import { useState, useRef, useEffect } from 'react';

/**
 * Shared open/close + logout state for PublicNavbar and StoreHeader.
 */
export function useFloatingNavbarState({ logout, navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate('/login');
  };

  return {
    mobileOpen,
    setMobileOpen,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    closeMenus,
    handleLogout,
  };
}

/** Scroll listener used by both navbars (StoreHeader may override via forceScrolled). */
export function useNavbarScrollThreshold(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
