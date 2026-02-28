import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store';

/**
 * AdminGuard Component
 * Protects routes that require admin access (is_staff or is_superuser)
 */
const AdminGuard = () => {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin (role === 'admin' or is_staff/is_superuser)
  const isAdmin = user.role === 'admin' || user.is_staff || user.is_superuser;

  if (!isAdmin) {
    // Redirect non-admin users to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
