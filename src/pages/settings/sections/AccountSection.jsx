import PasswordChangeForm from './account/PasswordChangeForm';
import EmailChangeForm from './account/EmailChangeForm';
import DeleteAccountSection from './account/DeleteAccountSection';

export default function AccountSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Account</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your password, email address, and account.</p>
      </div>
      <PasswordChangeForm />
      <EmailChangeForm />
      <DeleteAccountSection />
    </div>
  );
}
