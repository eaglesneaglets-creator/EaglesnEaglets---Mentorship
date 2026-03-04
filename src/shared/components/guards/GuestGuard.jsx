import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store';
import { getKYCRedirectPath } from '../../../shared/utils/getKYCRedirectPath';

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
    const redirectPath = getKYCRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default GuestGuard;

