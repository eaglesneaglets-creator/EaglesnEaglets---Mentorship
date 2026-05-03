import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { defaultSectionForRole } from './config/settingsNav';

export default function SettingsHomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      navigate(`/settings/${defaultSectionForRole(user.role)}`, { replace: true });
    }
  }, [user?.role, navigate]);

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
