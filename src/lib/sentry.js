import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking.
 * Only activates when VITE_SENTRY_DSN is set — safe to call in all environments.
 */
export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Sample 10% of traces in production to stay within quota
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0,
    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  });
}
