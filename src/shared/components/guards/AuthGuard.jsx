import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store';
import { getKYCRedirectPath } from '../../../shared/utils/getKYCRedirectPath';

// Routes that should be accessible even when KYC is not approved
const KYC_EXEMPT_ROUTES = [
  '/mentor-profile',
  '/mentee-profile',
  '/complete-profile',
  '/pending-approval',
  '/kyc',
  '/kyc/pending',
  '/store/cart',
  '/store/orders',
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

