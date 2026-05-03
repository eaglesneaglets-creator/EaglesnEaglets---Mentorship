import { useState } from 'react';
import { useAuthStore } from '@store';
import { useDeleteAccount } from '../../../../modules/auth/hooks/useAccount';

export default function DeleteAccountSection() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const mutation = useDeleteAccount();

  const reset = () => {
    setOpen(false);
    setConfirmEmail('');
    setPassword('');
    setError('');
  };

  const emailMatches = confirmEmail.trim().toLowerCase() === user?.email?.toLowerCase();
  const canSubmit = emailMatches && password.length > 0 && !mutation.isPending;

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    mutation.mutate(
      { currentPassword: password },
      {
        onError: (err) => {
          const msg = err?.response?.data?.error?.message
            || err?.response?.data?.current_password?.[0]
            || 'Could not delete account. Check your password.';
          setError(msg);
        },
      },
    );
  };

  return (
    <section className="bg-white border-2 border-red-200 rounded-2xl p-6 lg:p-8">
      <header className="mb-5">
        <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">warning</span>
          Danger zone
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Deleting your account is permanent. Your profile is anonymized and you cannot recover access.
        </p>
      </header>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-5 h-11 rounded-xl bg-white border-2 border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Delete account
        </button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 max-w-md">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            This will sign you out, anonymize your profile, and prevent future logins with this email. To confirm, type your email below.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Type your email <span className="font-mono text-xs text-slate-500">({user?.email})</span>
            </label>
            <input
              type="text"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? 'Deleting…' : 'Permanently delete my account'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={mutation.isPending}
              className="px-5 h-11 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
