import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../modules/auth/services/auth-service';

export default function EmailChangeConfirmPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(
    token ? { status: 'loading', message: '' } : { status: 'error', message: 'Invalid confirmation link.' }
  );

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    authService.confirmEmailChange(token)
      .then((res) => {
        if (cancelled) return;
        setState({ status: 'success', message: res?.message || 'Email updated. Please sign in with your new address.' });
        setTimeout(() => { if (!cancelled) navigate('/login', { replace: true }); }, 2500);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.response?.data?.error?.message || 'Link expired or already used.';
        setState({ status: 'error', message: msg });
      });

    return () => { cancelled = true; };
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        {state.status === 'loading' && (
          <>
            <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <h1 className="mt-5 text-lg font-bold text-slate-900">Confirming email change…</h1>
          </>
        )}
        {state.status === 'success' && (
          <>
            <span className="material-symbols-outlined text-5xl text-emerald-500">mark_email_read</span>
            <h1 className="mt-3 text-xl font-bold text-slate-900">Email updated</h1>
            <p className="mt-2 text-sm text-slate-600">{state.message}</p>
            <p className="mt-4 text-xs text-slate-400">Redirecting to sign in…</p>
          </>
        )}
        {state.status === 'error' && (
          <>
            <span className="material-symbols-outlined text-5xl text-red-500">error</span>
            <h1 className="mt-3 text-xl font-bold text-slate-900">Could not confirm email</h1>
            <p className="mt-2 text-sm text-slate-600">{state.message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block px-5 h-11 leading-[44px] rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
