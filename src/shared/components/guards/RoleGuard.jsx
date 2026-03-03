import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '@store';

/**
 * RoleGuard Component
 * Protects routes that require specific user roles
 */
const RoleGuard = ({ allowedRoles }) => {
  const { user, isLoading } = useAuthStore();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check if user's role is in the allowed roles
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on role
    if (user?.role === 'eaglet') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

RoleGuard.propTypes = {
  allowedRoles: PropTypes.arrayOf(
    PropTypes.oneOf(['eagle', 'eaglet', 'admin'])
  ).isRequired,
};

export default RoleGuard;
