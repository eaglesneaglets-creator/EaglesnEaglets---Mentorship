import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store';
import { getKYCRedirectPath } from '../../../shared/utils/getKYCRedirectPath';

// Routes that should be accessible even when KYC is not approved.
// SECURITY: Store routes (/store/cart, /store/orders) are NOT exempt —
// purchasing requires KYC approval. Order creation is also blocked at the
// backend level; this guard provides defence-in-depth on the frontend.
const KYC_EXEMPT_ROUTES = [
  '/mentor-profile',
  '/mentee-profile',
  '/complete-profile',
  '/pending-approval',
  '/kyc',
  '/kyc/pending',
];

/**
 * AuthGuard Component
 * Protects routes that require authentication and handles KYC-based redirects
 */
const AuthGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if current route is exempt from KYC checks
  const isKycExemptRoute = KYC_EXEMPT_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  // Admin users bypass KYC checks
  if (user?.role === 'admin') {
    return <Outlet />;
  }

  // For non-exempt routes, check KYC status and redirect accordingly
  if (!isKycExemptRoute && user) {
    const kycStatus = user.kyc_status;

    // Only allow through if KYC is approved (or status not requiring redirect)
    if (!kycStatus || kycStatus === 'draft' || kycStatus === 'submitted' ||
      kycStatus === 'under_review' || kycStatus === 'requires_changes' ||
      kycStatus === 'rejected') {
      const redirectTo = getKYCRedirectPath(user);
      // Avoid redirect loop: only redirect if target is different from current path
      if (redirectTo !== location.pathname) {
        return <Navigate to={redirectTo} replace />;
      }
    }
  }

  // KYC approved or exempt route - allow access
  return <Outlet />;
};

export default AuthGuard;

