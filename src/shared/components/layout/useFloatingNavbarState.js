import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Shared open/close + logout state for PublicNavbar and StoreHeader.
 */
export function useFloatingNavbarState({ logout, navigate }) {
  // Store the pathname where the drawer was opened so route changes close it
  // without a setState-in-effect (mobileOpenPath !== pathname => closed).
  const [mobileOpenPath, setMobileOpenPath] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const mobileOpen = mobileOpenPath === location.pathname;

  const setMobileOpen = useCallback((next) => {
    if (typeof next === 'function') {
      setMobileOpenPath((current) => {
        const isOpen = current === location.pathname;
        return next(isOpen) ? location.pathname : null;
      });
      return;
    }
    setMobileOpenPath(next ? location.pathname : null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  // Escape closes the mobile drawer (WCAG / platform convention).
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpenPath(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const closeMenus = useCallback(() => {
    setDropdownOpen(false);
    setMobileOpenPath(null);
  }, []);

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate('/login');
  };

  const toggleMobile = useCallback(() => {
    setMobileOpenPath((current) =>
      current === location.pathname ? null : location.pathname,
    );
  }, [location.pathname]);

  return {
    mobileOpen,
    setMobileOpen,
    toggleMobile,
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
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
