import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@store';
import { Alert } from '@components/ui';
import { authService } from '../../modules/auth/services/auth-service';
import { logger } from '../../shared/utils/logger';
import { loginSchema } from '../../modules/auth/schemas/register-schema';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';
// Brand-themed login illustration (Storyset "Personal Goals" recoloured to
// emerald) — visual rhymes with the "Soar to New Heights" tagline below.
import loginIllustration from '../../assets/LoginSVG.svg';
import { validateRedirectUrl } from '../../shared/utils/sanitize';

/* ═══════════════════════════════════════════════
   LEFT-SIDE ILLUSTRATION — fills the whole half
   The vector artwork spans the full left panel (no
   card frame): a soft pulsing halo behind it, orbiting
   accent badges, and drifting sparkles so the whole
   panel breathes. The panel's own emerald gradient is
   the ground; the art sits on top at large scale.
   ═══════════════════════════════════════════════ */
const BrandingIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Soft glow halo — large, behind the artwork */}
    <motion.div
      aria-hidden
      className="absolute inset-[8%] rounded-[3rem] bg-gradient-to-br from-white/30 via-emerald-200/25 to-amber-200/15 blur-3xl"
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* The artwork — fills the panel, gently floating */}
    <motion.img
      src={loginIllustration}
      alt="Mentee climbing toward new heights"
      className="relative z-10 w-full max-w-2xl h-auto max-h-[70vh] object-contain drop-shadow-2xl"
      loading="eager"
      decoding="async"
      animate={{ y: [0, -10, 0], scale: [1, 1.015, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Accent badge: book (top-left) */}
    <motion.div
      aria-hidden
      className="absolute top-[12%] left-[10%] w-16 h-16 rounded-full bg-white shadow-xl shadow-emerald-900/20 border border-emerald-100 flex items-center justify-center"
      animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="material-symbols-outlined text-emerald-600 text-3xl">menu_book</span>
    </motion.div>

    {/* Accent badge: lightbulb (top-right) */}
    <motion.div
      aria-hidden
      className="absolute top-[16%] right-[12%] w-[4.5rem] h-[4.5rem] rounded-full bg-white shadow-xl shadow-amber-900/25 border border-amber-100 flex items-center justify-center"
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
    >
      <span className="material-symbols-outlined text-amber-500 text-4xl">lightbulb</span>
    </motion.div>

    {/* Accent badge: graduation cap (mid-right) */}
    <motion.div
      aria-hidden
      className="absolute top-1/2 right-[8%] w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-900/20 border border-slate-100 flex items-center justify-center"
      animate={{ y: [0, -10, 0], rotate: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
    >
      <span className="material-symbols-outlined text-slate-700 text-3xl">school</span>
    </motion.div>

    {/* Drifting sparkles */}
    <motion.span
      aria-hidden
      className="absolute top-[20%] right-1/3 text-amber-400"
      animate={{ y: [0, -18, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="material-symbols-outlined text-xl">auto_awesome</span>
    </motion.span>
    <motion.span
      aria-hidden
      className="absolute bottom-[22%] left-1/3 text-emerald-200"
      animate={{ y: [0, -16, 0], opacity: [0.3, 0.9, 0.3], scale: [0.8, 1, 0.8] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
    >
      <span className="material-symbols-outlined text-lg">auto_awesome</span>
    </motion.span>
  </div>
);

/* ═══════════════════════════════════════════════
   PILL INPUT — local to the login page so the
   shape change doesn't leak into other forms.
   ═══════════════════════════════════════════════ */
const PillInput = ({
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  required = false,
  error,
  leftIcon,
  rightIcon,
  ariaLabel,
}) => (
  <div className="w-full">
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-label={ariaLabel || placeholder}
        className={`
          w-full h-14 ${leftIcon ? 'pl-14' : 'pl-6'} ${rightIcon ? 'pr-14' : 'pr-6'}
          rounded-full bg-white text-slate-900 text-sm sm:text-base
          placeholder:text-slate-400
          border ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-emerald-200'}
          focus:outline-none focus:ring-4 focus:border-emerald-500
          shadow-sm hover:shadow transition-all duration-200
        `.trim().replace(/\s+/g, ' ')}
      />
      {rightIcon && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
          {rightIcon}
        </div>
      )}
    </div>
    {error && <p className="mt-2 ml-5 text-xs text-red-600">{error}</p>}
  </div>
);

/**
 * LoginPage Component
 * User login page with Google OAuth support.
 * Layout: split — illustration left (lg+), form right.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resendVerification, isLoading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    // Seeded from the verify-email redirect so a just-verified user only has to
    // type their password. Falls back to empty for a normal login.
    email: location.state?.email || '',
    password: '',
    remember_me: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [showStateMessage, setShowStateMessage] = useState(true);
  const hasAutoResent = useRef(false);

  const stateMessage = location.state?.message;
  const isSessionExpiry = stateMessage?.toLowerCase().includes('session') ||
    stateMessage?.toLowerCase().includes('inactivity');

  const nextParam = new URLSearchParams(location.search).get('next');
  const redirectAfterLogin = nextParam || location.state?.from?.pathname || null;

  const isVerificationError = authError?.toLowerCase().includes('verify your email');

  useEffect(() => {
    if (stateMessage && showStateMessage) {
      const timer = setTimeout(() => setShowStateMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [stateMessage, showStateMessage]);

  useEffect(() => {
    const autoResend = async () => {
      if (isVerificationError && formData.email && !hasAutoResent.current && resendStatus === null) {
        hasAutoResent.current = true;
        setResendStatus('sending');
        try {
          await resendVerification(formData.email);
          setResendStatus('sent');
        } catch {
          setResendStatus('error');
        }
      }
    };
    autoResend();
  }, [isVerificationError, formData.email, resendVerification, resendStatus]);

  const prevAuthError = useRef(authError);
  useEffect(() => {
    if (prevAuthError.current && !authError) {
      hasAutoResent.current = false;
      setResendStatus(null);
    }
    prevAuthError.current = authError;
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (authError) clearError?.();
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await authService.getGoogleAuthUrl('');
      if (response.success && response.data.auth_url) {
        const authUrl = response.data.auth_url;
        try {
          const parsed = new URL(authUrl);
          if (parsed.hostname !== 'accounts.google.com' || parsed.protocol !== 'https:') {
            throw new Error('Invalid OAuth redirect URL');
          }
          window.location.href = authUrl;
        } catch {
          logger.error('Invalid Google auth URL received');
          setIsGoogleLoading(false);
        }
      }
    } catch (err) {
      logger.error('Failed to get Google auth URL:', err);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      const issues = result.error?.issues || result.error?.errors || [];
      issues.forEach((err) => {
        const field = err.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const user = await login(formData.email, formData.password);

      if (redirectAfterLogin) {
        const safeUrl = validateRedirectUrl(redirectAfterLogin, '/dashboard');
        navigate(safeUrl, { replace: true });
        return;
      }

      const isAdmin = user.is_staff || user.is_superuser || user.role === 'admin';

      if (isAdmin) {
        navigate('/admin/dashboard');
      } else if (user.role === 'eagle') {
        if (!user.kyc_status || user.kyc_status === 'draft') navigate('/mentor-profile');
        else if (user.kyc_status === 'submitted' || user.kyc_status === 'under_review') navigate('/pending-approval');
        else if (user.kyc_status === 'requires_changes' || user.kyc_status === 'rejected') navigate('/mentor-profile');
        else navigate('/dashboard');
      } else if (user.role === 'eaglet') {
        if (!user.kyc_status || user.kyc_status === 'draft') navigate('/mentee-profile');
        else if (user.kyc_status === 'submitted' || user.kyc_status === 'under_review') navigate('/pending-approval');
        else if (user.kyc_status === 'requires_changes') navigate('/mentee-profile');
        else navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      logger.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50">
      {/* ─── Left: Illustration panel (lg+) — vector fills the whole half ─── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        {/* Illustration fills the panel (leaving room for the tagline below) */}
        <div className="absolute inset-x-0 top-0 bottom-28 z-10 px-10 xl:px-16 pt-10">
          <BrandingIllustration />
        </div>

        {/* Tagline overlay, anchored above the fold / consent banner */}
        <div className="absolute bottom-10 xl:bottom-14 inset-x-0 z-20 px-10 text-center text-white">
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight drop-shadow-md">
            Soar to <span className="text-emerald-200">New Heights</span>
          </h1>
        </div>
      </div>

      {/* ─── Right: Login form ─── */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Minimal header: logo only */}
        <header className="p-5 sm:p-6 lg:p-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <img
              src={Logo}
              alt="Eagles & Eaglets"
              className="h-11 sm:h-12 w-auto rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-6 lg:px-10 pb-10">
          <div className="w-full max-w-md">
            {/* Page title — verb form + brand-green period accent
                pairs a confident bold weight with a subtle identity mark,
                matching the cadence of Linear/Notion/Vercel auth headers. */}
            <div className="text-center mb-7 sm:mb-9">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Log in<span className="text-emerald-500">.</span>
              </h1>
              <div className="mt-3 mx-auto w-12 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
            </div>

            {/* Alerts */}
            {stateMessage && showStateMessage && (
              <Alert
                variant={isSessionExpiry ? 'warning' : 'success'}
                className="mb-5 rounded-2xl"
                onClose={() => setShowStateMessage(false)}
              >
                {stateMessage}
              </Alert>
            )}

            {authError && (
              <Alert
                variant={isVerificationError ? 'warning' : 'error'}
                className="mb-5 rounded-2xl"
                onClose={clearError}
              >
                <div>
                  {isVerificationError ? (
                    <>
                      <p className="font-medium">Email verification required</p>
                      <div className="mt-2">
                        {resendStatus === 'sending' ? (
                          <p className="text-sm flex items-center gap-2">
                            <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                            Sending a new verification email...
                          </p>
                        ) : resendStatus === 'sent' ? (
                          <p className="text-sm text-emerald-700">
                            We&apos;ve sent another verification email to your inbox.
                          </p>
                        ) : resendStatus === 'error' ? (
                          <p className="text-sm text-red-700">
                            Failed to send verification email. Please try again later.
                          </p>
                        ) : (
                          <p className="text-sm">Please check your inbox for the verification link.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p>{authError}</p>
                  )}
                </div>
              </Alert>
            )}

            {/* Google Sign In — pill */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="group w-full h-14 flex items-center justify-center gap-3 px-6 rounded-full
                bg-white text-slate-700 text-sm sm:text-base font-semibold
                border border-slate-200 shadow-sm
                hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5
                active:translate-y-0 active:scale-[0.99]
                transition-all duration-200 mb-5
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isGoogleLoading ? (
                <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-slate-400 rounded-full">or sign in with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <PillInput
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                autoComplete="email"
                inputMode="email"
                required
                error={errors.email}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <PillInput
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                required
                error={errors.password}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between px-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="remember_me"
                    checked={formData.remember_me}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In — pill */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-2 rounded-full
                  bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base font-bold
                  shadow-lg shadow-emerald-500/30
                  hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5
                  active:translate-y-0 active:scale-[0.99]
                  transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                  focus:outline-none focus:ring-4 focus:ring-emerald-200
                  inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
