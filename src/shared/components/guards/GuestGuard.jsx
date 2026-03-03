import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store';

/**
 * Helper function to get the appropriate redirect path based on user role and KYC status
 */
const getRedirectPath = (user) => {
  // Admin users go directly to admin dashboard
  if (user?.role === 'admin') {
    return '/admin/dashboard';
  }

  const kycStatus = user?.kyc_status;

  // KYC not started or in draft - redirect to profile completion
  if (!kycStatus || kycStatus === 'draft') {
    if (user?.role === 'eagle') {
      return '/mentor-profile';
    }
    if (user?.role === 'eaglet') {
      return '/mentee-profile';
    }
  }

  // KYC submitted or under review - redirect to pending approval
  if (kycStatus === 'submitted' || kycStatus === 'under_review') {
    return '/pending-approval';
  }

  // KYC requires changes - redirect to profile to make updates
  if (kycStatus === 'requires_changes') {
    if (user?.role === 'eagle') {
      return '/mentor-profile';
    }
    if (user?.role === 'eaglet') {
      return '/mentee-profile';
    }
  }

  // KYC rejected - redirect to pending approval (will show rejection message)
  if (kycStatus === 'rejected') {
    return '/pending-approval';
  }

  // KYC approved - redirect to role-specific dashboard
  if (user?.role === 'eagle') {
    return '/eagle/dashboard';
  }
  if (user?.role === 'eaglet') {
    return '/eaglet/dashboard';
  }

  return '/dashboard';
};

/**
 * GuestGuard Component
 * Protects routes that should only be accessible to guests (non-authenticated users)
 */
const GuestGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

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
    // Determine the correct redirect path based on KYC status
    const redirectPath = getRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
