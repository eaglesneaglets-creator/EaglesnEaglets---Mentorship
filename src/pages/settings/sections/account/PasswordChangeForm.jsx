import { useState } from 'react';
import { useChangePassword } from '../../../../modules/auth/hooks/useAccount';

export default function PasswordChangeForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const mutation = useChangePassword();

  const reset = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    mutation.mutate(
      { oldPassword, newPassword, newPasswordConfirm: confirmPassword },
      {
        onSuccess: reset,
        onError: (err) => {
          const msg = err?.response?.data?.error?.message || err?.response?.data?.detail
            || 'Could not update password. Check your current password.';
          setError(msg);
        },
      },
    );
  };

  return (
    <section className="bg-white border border-slate-200/70 rounded-2xl p-6 lg:p-8">
      <header className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">Change password</h3>
        <p className="mt-1 text-sm text-slate-500">Use at least 8 characters.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={() => setShowOld((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
              aria-label={showOld ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-lg">{showOld ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-lg">{showNew ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm new password</label>
          <input
            type={showNew ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-5 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
