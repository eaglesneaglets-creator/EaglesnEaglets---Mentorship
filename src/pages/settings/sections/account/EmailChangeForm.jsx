import { useState } from 'react';
import { useAuthStore } from '@store';
import { useRequestEmailChange } from '../../../../modules/auth/hooks/useAccount';

export default function EmailChangeForm() {
  const { user } = useAuthStore();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null); // email address awaiting confirmation

  const mutation = useRequestEmailChange();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newEmail.toLowerCase().trim() === user?.email?.toLowerCase()) {
      setError('New email must differ from your current email.');
      return;
    }
    mutation.mutate(
      { newEmail: newEmail.trim(), currentPassword },
      {
        onSuccess: () => {
          setPending(newEmail.trim());
          setNewEmail('');
          setCurrentPassword('');
        },
        onError: (err) => {
          const msg = err?.response?.data?.error?.message
            || err?.response?.data?.new_email?.[0]
            || err?.response?.data?.current_password?.[0]
            || 'Could not send verification. Try again.';
          setError(msg);
        },
      },
    );
  };

  return (
    <section className="bg-white border border-slate-200/70 rounded-2xl p-6 lg:p-8">
      <header className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">Change email address</h3>
        <p className="mt-1 text-sm text-slate-500">A verification link will be sent to your new address. Your email updates only after you click it.</p>
      </header>

      <div className="mb-4 max-w-md">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Current email</label>
        <input
          type="email"
          value={user?.email || ''}
          readOnly
          className="w-full h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed"
        />
      </div>

      {pending && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 max-w-md">
          <p className="text-sm text-emerald-800">
            <span className="material-symbols-outlined align-middle text-base mr-1">mark_email_read</span>
            Verification sent to <strong>{pending}</strong>. Check your inbox to confirm.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
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
          {mutation.isPending ? 'Sending…' : 'Send verification email'}
        </button>
      </form>
    </section>
  );
}
