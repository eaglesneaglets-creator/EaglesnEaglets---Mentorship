/**
 * SessionTimeoutWarning Component
 *
 * Modal warning displayed before automatic logout due to inactivity.
 * Allows user to extend session or logout immediately.
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';

const SessionTimeoutWarning = ({
  isOpen,
  remainingTime,
  onExtendSession,
  onLogout,
}) => {
  // Format remaining time as MM:SS
  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExtendSession();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExtendSession]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="timeout-title"
      aria-describedby="timeout-description"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2
                id="timeout-title"
                className="text-xl font-bold text-white"
              >
                Session Expiring
              </h2>
              <p className="text-white/80 text-sm">
                Are you still there?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p
            id="timeout-description"
            className="text-gray-600 text-center mb-6"
          >
            For your security, you will be automatically logged out in:
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full border-4 border-amber-500 flex items-center justify-center"
                style={{
                  background: `conic-gradient(
                    #f59e0b ${(remainingTime / (2 * 60 * 1000)) * 360}deg,
                    #f3f4f6 0deg
                  )`,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">
                    {formatTime(remainingTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mb-6">
            Click &quot;Stay Logged In&quot; to continue your session, or
            &quot;Logout Now&quot; to end it immediately.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Logout Now
            </button>
            <button
              onClick={onExtendSession}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              autoFocus
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SessionTimeoutWarning.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  remainingTime: PropTypes.number.isRequired,
  onExtendSession: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default SessionTimeoutWarning;
