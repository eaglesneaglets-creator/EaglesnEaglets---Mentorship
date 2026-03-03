/**
 * useInactivityTimeout Hook
 *
 * Monitors user activity and triggers logout after specified inactivity period.
 * Security feature: Protects user sessions from unauthorized access on unattended devices.
 *
 * @param {number} timeoutMs - Inactivity timeout in milliseconds (default: 15 minutes)
 * @param {number} warningMs - Warning before logout in milliseconds (default: 2 minutes)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@store';

const DEFAULT_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING = 2 * 60 * 1000;  // 2 minutes before timeout

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel',
];

export const useInactivityTimeout = ({
  timeoutMs = DEFAULT_TIMEOUT,
  warningMs = DEFAULT_WARNING,
  onWarning,
  onTimeout,
  enabled = true,
} = {}) => {
  const { isAuthenticated, logout } = useAuthStore();
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const lastActivityRef = useRef(Date.now()); // eslint-disable-line react-hooks/purity
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningMs);
  const countdownRef = useRef(null);

  // Reset timers on activity
  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (!enabled || !isAuthenticated) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingTime(warningMs);
      onWarning?.();

      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            clearInterval(countdownRef.current);
          }
          return Math.max(0, newTime);
        });
      }, 1000);
    }, timeoutMs - warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      setShowWarning(false);
      if (countdownRef.current) clearInterval(countdownRef.current);

      // Dispatch session expired event
      window.dispatchEvent(
        new CustomEvent('auth:logout', { detail: { reason: 'session_expired' } })
      );

      await logout();
      onTimeout?.();
    }, timeoutMs);
  }, [enabled, isAuthenticated, logout, onWarning, onTimeout, timeoutMs, warningMs]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    // Throttle activity handling (max once per second)
    const now = Date.now();
    if (now - lastActivityRef.current < 1000) return;

    resetTimers();
  }, [resetTimers]);

  // Extend session (called when user clicks "Stay logged in")
  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Setup activity listeners
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      // Cleanup if disabled or not authenticated
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setShowWarning(false);
      return;
    }

    // Initial timer setup
    resetTimers();

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Listen for activity from other tabs
    const handleStorage = (e) => {
      if (e.key === 'lastActivity') {
        resetTimers();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Broadcast activity to other tabs
    const broadcastActivity = () => {
      try {
        localStorage.setItem('lastActivity', Date.now().toString());
      } catch {
        // Ignore localStorage errors
      }
    };

    // Broadcast activity periodically when active
    const broadcastInterval = setInterval(broadcastActivity, 5000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('storage', handleStorage);
      clearInterval(broadcastInterval);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, isAuthenticated, handleActivity, resetTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return {
    showWarning,
    remainingTime,
    extendSession,
    resetTimers,
  };
};

export default useInactivityTimeout;
