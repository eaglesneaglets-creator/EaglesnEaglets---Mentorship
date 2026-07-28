import { Link } from 'react-router-dom';
import BrandLogo from '../../shared/components/ui/BrandLogo';

const SUPPORT_EMAIL = 'info.eaglesandeaglets@gmail.com';

/**
 * SuspendedPage — shown when an account has been suspended (Phase 26-01b).
 *
 * Reached by a hard redirect from the API client when any request returns
 * 403 + error_code 'account_suspended'. The session is already cleared by
 * then, so this page is fully public and must not depend on auth state.
 *
 * Deliberately generic: it does NOT show the admin's internal
 * `suspension_reason` (those are internal notes). Users are pointed to
 * support to appeal.
 */
const SuspendedPage = () => (
  <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Link to="/" aria-label="Eagles &amp; Eaglets home">
          <BrandLogo width={56} height={56} className="rounded-xl" />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {/* Amber accent — a warning state, not an error and not success */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />

        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-amber-500 text-3xl" aria-hidden="true">
              lock
            </span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Your account has been suspended
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Access to Eagles &amp; Eaglets has been paused for this account. If you
            believe this is a mistake, or you&apos;d like to appeal, please get in
            touch with our team — we&apos;ll review it with you.
          </p>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Account%20suspension%20appeal`}
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary-dark hover:shadow-md transition-all duration-300 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
            Contact support
          </a>

          <p className="text-xs text-slate-400 mt-4 break-all">{SUPPORT_EMAIL}</p>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-500 hover:text-primary transition-colors duration-300"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Need help with something else?{' '}
        <Link to="/" className="text-slate-500 hover:text-primary transition-colors">
          Back to home
        </Link>
      </p>
    </div>
  </main>
);

export default SuspendedPage;
