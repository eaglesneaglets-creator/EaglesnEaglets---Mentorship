/**
 * InactivityManager Component
 *
 * Wraps the application to provide session timeout management.
 * Displays warning modal before automatic logout.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import { useAuthStore } from '@store';
import SessionTimeoutWarning from './SessionTimeoutWarning';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes warning

const InactivityManager = ({ children }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();

  const handleWarning = useCallback(() => {
    // Could add analytics tracking here
    console.debug('[Session] Inactivity warning triggered');
  }, []);

  const handleTimeout = useCallback(() => {
    console.debug('[Session] Session timed out due to inactivity');
    navigate('/login', {
      replace: true,
      state: { message: 'Your session expired due to inactivity. Please log in again.' },
    });
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

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
