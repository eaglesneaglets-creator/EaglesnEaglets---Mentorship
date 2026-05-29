import { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'ee_cookie_consent';

const readConsent = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeConsent = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: new Date().toISOString() }));
  } catch {
    /* ignore unavailable storage (private mode, etc.) */
  }
};

/**
 * CookieConsentBanner — GDPR cookie-notice STUB.
 *
 * Records acknowledgment only; it does NOT load or gate any analytics/tracking
 * (none exists yet). Shows once per visitor, then persists the choice in
 * localStorage so it never reappears. Non-blocking bottom bar.
 */
const CookieConsentBanner = () => {
  const [dismissed, setDismissed] = useState(() => readConsent() !== null);

  if (dismissed) return null;

  const close = (value) => {
    writeConsent(value);
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-white/95 backdrop-blur-md shadow-lg p-4 sm:flex sm:items-center sm:gap-4">
        <p className="text-sm text-text-secondary">
          We use essential cookies to run the platform. See our{' '}
          <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>.
        </p>
        <div className="mt-3 sm:mt-0 sm:ml-auto flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => close('accepted')}
            className="px-4 py-2 min-h-[40px] rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => close('dismissed')}
            aria-label="Dismiss cookie notice"
            className="px-3 py-2 min-h-[40px] rounded-full text-sm font-medium text-text-secondary hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
