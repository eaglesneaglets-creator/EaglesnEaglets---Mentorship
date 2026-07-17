import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '@store';

/**
 * SuperAdminRoute — gates superadmin-only surfaces (Nests platform management,
 * Donations, Store orders, admin-lifecycle actions).
 *
 * A scoped (dual-role) admin — is_platform_staff but not is_superuser — is
 * redirected to the admin dashboard. This is defense in depth: the backend
 * already 403s these endpoints via core.permissions.IsSuperAdmin, so this only
 * avoids rendering a page the user can't use.
 *
 * Wrap a route element:  <SuperAdminRoute><AdminDonationsPage /></SuperAdminRoute>
 */
export default function SuperAdminRoute({ children }) {
  const { user } = useAuthStore();

  if (!user?.is_superuser) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

SuperAdminRoute.propTypes = {
  children: PropTypes.node,
};
