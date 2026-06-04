import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store';
import { getKYCRedirectPath } from '../../../shared/utils/getKYCRedirectPath';
import { validateRedirectUrl } from '../../utils/sanitize';

/**
 * GuestGuard Component
 * Protects routes that should only be accessible to guests (non-authenticated users).
 *
 * When already-authenticated users land on /login (or /register) carrying a
 * `?next=<path>` param — e.g. AdminInviteAcceptPage bounced them there — we
 * honor that target instead of force-routing to the default dashboard. Without
 * this, deep links like the admin-invite acceptance URL get silently dropped
 * for users who happen to have an active session in another tab.
 */
const GuestGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { search } = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to appropriate page if already authenticated
  if (isAuthenticated && user) {
    const nextParam = new URLSearchParams(search).get('next');
    if (nextParam) {
      const safeNext = validateRedirectUrl(nextParam, getKYCRedirectPath(user));
      return <Navigate to={safeNext} replace />;
    }
    const redirectPath = getKYCRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default GuestGuard;

