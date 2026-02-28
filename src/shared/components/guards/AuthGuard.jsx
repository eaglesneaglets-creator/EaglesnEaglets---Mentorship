import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store';

// Routes that should be accessible even when KYC is not approved
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

    // KYC not started or in draft - redirect to profile completion
    if (!kycStatus || kycStatus === 'draft') {
      if (user.role === 'eagle') {
        return <Navigate to="/mentor-profile" replace />;
      }
      if (user.role === 'eaglet') {
        return <Navigate to="/mentee-profile" replace />;
      }
    }

    // KYC submitted or under review - redirect to pending approval
    if (kycStatus === 'submitted' || kycStatus === 'under_review') {
      return <Navigate to="/pending-approval" replace />;
    }

    // KYC requires changes - redirect to profile to make updates
    if (kycStatus === 'requires_changes') {
      if (user.role === 'eagle') {
        return <Navigate to="/mentor-profile" replace />;
      }
      if (user.role === 'eaglet') {
        return <Navigate to="/mentee-profile" replace />;
      }
    }

    // KYC rejected - redirect to pending approval (will show rejection message)
    if (kycStatus === 'rejected') {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  // KYC approved or exempt route - allow access
  return <Outlet />;
};

export default AuthGuard;
