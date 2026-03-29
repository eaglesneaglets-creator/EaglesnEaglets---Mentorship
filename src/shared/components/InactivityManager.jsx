/**
 * InactivityManager Component
 *
 * Wraps the application to provide session timeout management.
 * Displays warning modal before automatic logout.
 */

import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import { useAuthStore } from '@store';
import SessionTimeoutWarning from './SessionTimeoutWarning';

// Routes that are public — session expiry should not force a login redirect here
const PUBLIC_ROUTES = ['/store', '/login', '/register', '/forgot-password', '/verify-email', '/reset-password'];

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes warning

const InactivityManager = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuthStore();

  const isPublicRoute = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));

  const handleWarning = useCallback(() => {
    // Could add analytics tracking here
    console.debug('[Session] Inactivity warning triggered');
  }, []);

  const handleTimeout = useCallback(() => {
    console.debug('[Session] Session timed out due to inactivity');
    if (isPublicRoute) return;
    navigate('/login', {
      replace: true,
      state: { message: 'Your session expired due to inactivity. Please log in again.' },
    });
  }, [navigate, isPublicRoute]);

  const handleLogout = useCallback(async () => {
    await logout();
    if (isPublicRoute) return;
    navigate('/login', { replace: true });
  }, [logout, navigate, isPublicRoute]);

  const {
    showWarning,
    remainingTime,
    extendSession,
  } = useInactivityTimeout({
    timeoutMs: INACTIVITY_TIMEOUT,
    warningMs: WARNING_BEFORE_TIMEOUT,
    onWarning: handleWarning,
    onTimeout: handleTimeout,
    enabled: isAuthenticated,
  });

  return (
    <>
      {children}
      <SessionTimeoutWarning
        isOpen={showWarning}
        remainingTime={remainingTime}
        onExtendSession={extendSession}
        onLogout={handleLogout}
      />
    </>
  );
};

export default InactivityManager;
