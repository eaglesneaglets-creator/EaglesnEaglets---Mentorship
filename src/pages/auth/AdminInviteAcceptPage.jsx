/**
 * AdminInviteAcceptPage (plan 18-02, hardened 18-04 revision).
 *
 * Public route /admin-role/accept/:token. Behavior:
 *   - Unauthenticated → redirect to /login?next=<current url>
 *   - Authenticated + email matches → silent accept, show success card
 *   - Authenticated + email mismatch → mismatch card with logout CTA
 *   - Invalid/expired token → generic "invite no longer valid" (no enumeration)
 *
 * Hardening notes:
 *   - Module-level `tokenResults` survives strict-mode remounts AND
 *     re-render storms (deps change) so the mutation fires exactly once
 *     per token per SPA session.
 *   - UI state derives from `tokenResults[token]` instead of useState,
 *     so a remount mid-flight still resolves to the correct card once
 *     the underlying mutation completes.
 *   - On success, force `refreshAccessStatus()` so the auth-store's
 *     `user.is_platform_staff` flips to true and the sidebar role
 *     switcher appears immediately without a manual page refresh.
 */

import { useEffect, useReducer } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@store';
import { useAcceptInvite } from '@modules/admin-role/hooks/useAdminRole';
import Logo from '@/assets/EaglesnEagletsLogo.jpeg';

// Module-scoped — persists across all mounts of this page within the
// current SPA session. Maps token -> { status, code? } so we never
// re-fire the mutation, and we always render the right card.
//   status: 'pending' | 'success' | 'error'
const tokenResults = new Map();
const tokenResultListeners = new Set();

function setTokenResult(token, value) {
  tokenResults.set(token, value);
  tokenResultListeners.forEach((fn) => fn());
}

function Shell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <img src={Logo} alt="Eagles & Eaglets" className="h-12 w-auto rounded-xl shadow-md" />
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({ icon, iconBg, title, children, actions }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 sm:p-10">
      <div className={`w-14 h-14 mx-auto rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">{title}</h1>
      <div className="text-sm text-slate-600 text-center leading-relaxed">{children}</div>
      {actions && <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">{actions}</div>}
    </div>
  );
}

export default function AdminInviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);
  const acceptMutation = useAcceptInvite();

  // Subscribe to module-level result updates so a strict-mode remount
  // that didn't own the firing instance still re-renders when its
  // callback writes to the Map.
  const [, forceRender] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    tokenResultListeners.add(forceRender);
    return () => tokenResultListeners.delete(forceRender);
  }, []);

  // Read whatever has been recorded for this token so far.
  const recorded = tokenResults.get(token);

  useEffect(() => {
    if (!isAuthenticated || !user || !token) return;
    // Already attempted (pending, success, or error) — don't re-fire.
    if (tokenResults.has(token)) return;

    setTokenResult(token, { status: 'pending', startedAt: Date.now() });
    acceptMutation.mutate(token, {
      onSuccess: () => {
        setTokenResult(token, { status: 'success' });
        // Pull the new is_platform_staff flag into auth-store so the
        // sidebar role switcher appears on next render.
        refreshAccessStatus?.();
      },
      onError: (err) => {
        const code = err?.code || err?.response?.data?.error?.type || 'invalid';
        setTokenResult(token, { status: 'error', code });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, token]);

  // Watchdog: if the mutation hasn't resolved (success or error) within 15s,
  // flip to a recoverable error state. Without this, an orphaned pending entry
  // in tokenResults (e.g. user navigated away mid-mutation) would keep the
  // page stuck on "Processing invite…" forever on every revisit.
  useEffect(() => {
    if (!token || recorded?.status !== 'pending') return;
    const startedAt = recorded.startedAt || Date.now();
    const remaining = Math.max(0, 15_000 - (Date.now() - startedAt));
    const timer = setTimeout(() => {
      const latest = tokenResults.get(token);
      if (latest?.status === 'pending') {
        setTokenResult(token, { status: 'error', code: 'timeout' });
      }
    }, remaining);
    return () => clearTimeout(timer);
  }, [token, recorded?.status, recorded?.startedAt]);

  const handleRetry = () => {
    if (!token) return;
    tokenResults.delete(token);
    setTokenResult(token, { status: 'pending', startedAt: Date.now() });
    acceptMutation.mutate(token, {
      onSuccess: () => {
        setTokenResult(token, { status: 'success' });
        refreshAccessStatus?.();
      },
      onError: (err) => {
        const code = err?.code || err?.response?.data?.error?.type || 'invalid';
        setTokenResult(token, { status: 'error', code });
      },
    });
  };

  // Unauthenticated → bounce to login with redirect target.
  if (!isAuthenticated) {
    const next = `/admin-role/accept/${token}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  // ─── Success ─────────────────────────────────────────────────────────────
  if (recorded?.status === 'success') {
    return (
      <Shell>
        <Card
          icon="shield_person"
          iconBg="bg-emerald-50 text-emerald-600"
          title="You're now an admin"
          actions={
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
            >
              Go to admin dashboard
            </button>
          }
        >
          <p>
            Welcome to the admin team. Use the role switcher in the sidebar to
            jump between mentor and admin view at any time.
          </p>
        </Card>
      </Shell>
    );
  }

  // ─── Email mismatch ──────────────────────────────────────────────────────
  if (recorded?.status === 'error' && recorded.code === 'email_mismatch') {
    return (
      <Shell>
        <Card
          icon="alternate_email"
          iconBg="bg-amber-50 text-amber-600"
          title="Wrong account"
          actions={
            <>
              <button
                type="button"
                onClick={async () => {
                  tokenResults.delete(token); // allow retry after re-login
                  await logout();
                  navigate(`/login?next=/admin-role/accept/${token}`);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Sign out and log in with the invited email
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
              >
                Go home
              </Link>
            </>
          }
        >
          <p>
            This invite was sent to a different email address. Sign out and log
            back in with the email that received the invite to accept it.
          </p>
        </Card>
      </Shell>
    );
  }

  // ─── Already admin ───────────────────────────────────────────────────────
  if (recorded?.status === 'error' && recorded.code === 'already_admin') {
    return (
      <Shell>
        <Card
          icon="shield_person"
          iconBg="bg-emerald-50 text-emerald-600"
          title="You're already an admin"
          actions={
            <Link
              to="/admin/dashboard"
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Go to admin dashboard
            </Link>
          }
        >
          <p>You already have platform-admin privileges. No further action needed.</p>
        </Card>
      </Shell>
    );
  }

  // ─── Timeout (watchdog) — give a retry CTA, not a dead-end ──────────────
  if (recorded?.status === 'error' && recorded.code === 'timeout') {
    return (
      <Shell>
        <Card
          icon="schedule"
          iconBg="bg-amber-50 text-amber-600"
          title="Taking longer than expected"
          actions={
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Try again
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
              >
                Go home
              </Link>
            </>
          }
        >
          <p>
            We couldn&apos;t verify your invite in time. Check your connection and try again.
          </p>
        </Card>
      </Shell>
    );
  }

  // ─── Invalid / expired (generic to prevent enumeration) ──────────────────
  if (recorded?.status === 'error') {
    return (
      <Shell>
        <Card
          icon="link_off"
          iconBg="bg-slate-100 text-slate-500"
          title="Invite no longer valid"
          actions={
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Try again
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
              >
                Go home
              </Link>
            </>
          }
        >
          <p>
            This invite link can&apos;t be used right now. It may have been revoked, expired,
            or already accepted. If you think this is a mistake, contact the admin
            who sent the invite.
          </p>
        </Card>
      </Shell>
    );
  }

  // ─── Pending (default) ──────────────────────────────────────────────────
  return (
    <Shell>
      <Card icon="hourglass_top" iconBg="bg-amber-50 text-amber-600" title="Processing invite…">
        <p>Verifying and accepting your admin invite.</p>
      </Card>
    </Shell>
  );
}
