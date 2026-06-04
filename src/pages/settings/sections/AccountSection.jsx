import { useAuthStore } from '@store';
import PasswordChangeForm from './account/PasswordChangeForm';
import EmailChangeForm from './account/EmailChangeForm';
import AdminRoleSection from './account/AdminRoleSection';
import DeleteAccountSection from './account/DeleteAccountSection';

export default function AccountSection() {
  const { user } = useAuthStore();
  // Plan 22-02: opened to eaglets as well. Pure admins + visitors still skipped.
  const canSeeAdminRoleSection =
    user?.role === 'eagle' || user?.role === 'eaglet';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Account</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your password, email address, and account.</p>
      </div>
      <PasswordChangeForm />
      <EmailChangeForm />
      {/* Admin role EOI surface — mentors and mentees per plan 22. */}
      {canSeeAdminRoleSection && <AdminRoleSection />}
      <DeleteAccountSection />
    </div>
  );
}
