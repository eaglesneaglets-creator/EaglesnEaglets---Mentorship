import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store';
import { Button, Input, Checkbox, Alert } from '@components/ui';
import { authService } from '../../modules/auth/services/auth-service';
import { logger } from '../../shared/utils/logger';
import { loginSchema } from '../../modules/auth/schemas/register-schema';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';
import { validateRedirectUrl } from '../../shared/utils/sanitize';

const Feather = ({ delay, duration, left, size = 24 }) => (
  <svg
    className="absolute text-white/20 animate-feather-float"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      left: `${left}%`,
      width: size,
      height: size,
    }}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.12 6.71c-2.15-2.15-5.64-2.15-7.79 0l-2.12 2.12c-.59.59-.59 1.54 0 2.12.59.59 1.54.59 2.12 0l2.12-2.12c.98-.98 2.56-.98 3.54 0 .98.98.98 2.56 0 3.54l-6.36 6.36c-.98.98-2.56.98-3.54 0-.98-.98-.98-2.56 0-3.54l.71-.71c.59-.59.59-1.54 0-2.12-.59-.59-1.54-.59-2.12 0l-.71.71c-2.15 2.15-2.15 5.64 0 7.79 2.15 2.15 5.64 2.15 7.79 0l6.36-6.36c2.15-2.15 2.15-5.64 0-7.79z" />
  </svg>
);

/**
 * LoginPage Component
 * User login page with Google OAuth support and animated branding
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resendVerification, isLoading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_me: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState(null); // 'sending', 'sent', 'error'
  const [showStateMessage, setShowStateMessage] = useState(true);
  const hasAutoResent = useRef(false);

  const stateMessage = location.state?.message;
  const isSessionExpiry = stateMessage?.toLowerCase().includes('session') ||
    stateMessage?.toLowerCase().includes('inactivity');

  // Capture redirect target from ?next= param or router state
  const nextParam = new URLSearchParams(location.search).get('next');
  const redirectAfterLogin = nextParam || location.state?.from?.pathname || null;

  // Check if the error is about email verification
  const isVerificationError = authError?.toLowerCase().includes('verify your email');

  // Auto-dismiss the state message after 5 seconds
  useEffect(() => {
    if (stateMessage && showStateMessage) {
      const timer = setTimeout(() => {
        setShowStateMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stateMessage, showStateMessage]);

  // Auto-resend verification email when verification error is detected
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

  // Reset auto-resend flag when error clears
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      clearError?.();
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      // For login, we don't need to specify role - backend will use existing user's role
      // or default to eaglet for new users
      const response = await authService.getGoogleAuthUrl('eaglet');
      if (response.success && response.data.auth_url) {
        // Security: validate redirect URL to prevent open redirect attacks
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

    // Validate form data
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      // Zod v3+ uses 'issues' instead of 'errors'
      const issues = result.error?.issues || result.error?.errors || [];
      issues.forEach((err) => {
        const field = err.path[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const user = await login(formData.email, formData.password);

      // If there's a ?next= or state.from redirect target, go there first
      // Security: validate redirect URL to prevent open redirect attacks
      if (redirectAfterLogin) {
        const safeUrl = validateRedirectUrl(redirectAfterLogin, '/dashboard');
        navigate(safeUrl, { replace: true });
        return;
      }

      // Redirect based on user role and status
      const isAdmin = user.is_staff || user.is_superuser || user.role === 'admin';

      if (isAdmin) {
        // Admin users go to admin dashboard
        navigate('/admin/dashboard');
      } else if (user.role === 'eagle') {
        // Eagle users - check KYC status
        if (!user.kyc_status || user.kyc_status === 'draft') {
          navigate('/mentor-profile');
        } else if (user.kyc_status === 'submitted' || user.kyc_status === 'under_review') {
          navigate('/pending-approval');
        } else if (user.kyc_status === 'requires_changes' || user.kyc_status === 'rejected') {
          navigate('/mentor-profile');
        } else {
          navigate('/dashboard');
        }
      } else if (user.role === 'eaglet') {
        // Eaglet users - check KYC status (Eaglets now require admin approval)
        if (!user.kyc_status || user.kyc_status === 'draft') {
          navigate('/mentee-profile');
        } else if (user.kyc_status === 'submitted' || user.kyc_status === 'under_review') {
          navigate('/pending-approval');
        } else if (user.kyc_status === 'requires_changes') {
          navigate('/mentee-profile');
        } else if (user.kyc_status === 'approved') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      logger.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* CSS for animations */}
      <style>{`
        @keyframes feather-float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
          }
        }
        @keyframes float-up {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes eagle-soar {
          0% {
            transform: translateX(-100%) translateY(50px) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateX(400%) translateY(-100px) scale(1.2);
            opacity: 0;
          }
        }
        .animate-feather-float {
          animation: feather-float linear infinite;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-float-up {
          animation: float-up 4s ease-in-out infinite;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }
        .animate-eagle-soar {
          animation: eagle-soar 12s ease-in-out infinite;
        }
        .btn-hover-lift {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (hover: hover) {
          .btn-hover-lift:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.4);
          }
        }
        .btn-hover-lift:active {
          transform: translateY(0) scale(0.98);
        }
        .link-hover-effect {
          position: relative;
          transition: all 0.3s ease;
        }
        .link-hover-effect::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
          transition: width 0.3s ease;
        }
        @media (hover: hover) {
          .link-hover-effect:hover::after {
            width: 100%;
          }
          .link-hover-effect:hover {
            color: #16A34A;
          }
        }
        /* Reduce animations on mobile for performance */
        @media (max-width: 768px) {
          .animate-feather-float,
          .animate-eagle-soar {
            animation: none;
            display: none;
          }
        }
      `}</style>

      {/* Left Side - Animated Branding (Hidden on mobile, shown on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary) 25%, var(--color-primary-dark) 50%, #166534 75%, var(--color-primary) 100%)',
            backgroundSize: '400% 400%',
          }}
        />

        {/* Floating feathers - reduced on smaller desktop screens */}
        <Feather delay={0} duration={15} left={10} size={20} />
        <Feather delay={2} duration={18} left={25} size={16} />
        <Feather delay={4} duration={20} left={40} size={24} />
        <Feather delay={6} duration={16} left={55} size={18} />
        <Feather delay={8} duration={22} left={70} size={22} />
        <Feather delay={10} duration={17} left={85} size={14} />
        <Feather delay={3} duration={19} left={15} size={28} />
        <Feather delay={7} duration={21} left={60} size={20} />

        {/* Flying eagle silhouette */}
        <div className="absolute top-1/4 animate-eagle-soar">
          <svg className="w-12 h-12 xl:w-16 xl:h-16 text-white/10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.9 8.89l-1.05-4.37c-.22-.9-1-1.52-1.91-1.52H5.05c-.9 0-1.69.63-1.9 1.52L2.1 8.89c-.24 1.02.27 2.06 1.23 2.51l.5.24-.74 6.65c-.12 1.07.74 2 1.81 2h14.2c1.07 0 1.93-.93 1.81-2l-.74-6.65.5-.24c.96-.45 1.47-1.49 1.23-2.51zm-4.39 9.79H6.49l.74-6.65 4.77 2.31 4.77-2.31.74 6.65z" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-6 lg:p-8 xl:p-12 text-white w-full">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/10 backdrop-blur-sm mb-4 lg:mb-6 animate-slide-in-right"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span className="text-xs lg:text-sm font-medium tracking-wide">Official Partner Platform</span>
            </div>

            {/* Main heading with staggered animation */}
            <h1
              className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight animate-slide-in-right"
              style={{ animationDelay: '0.4s' }}
            >
              Soar to <br />
              <span className="text-emerald-200 animate-float-up inline-block">New Heights</span>
            </h1>

            <p
              className="text-sm lg:text-base xl:text-lg opacity-90 leading-relaxed mb-6 lg:mb-8 animate-slide-in-right"
              style={{ animationDelay: '0.6s' }}
            >
              Join our community of world-class mentors and aspiring mentees to unlock your full potential today.
            </p>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-2 lg:gap-3 xl:gap-4 animate-slide-in-right"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="text-center p-2 lg:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-lg lg:text-xl xl:text-2xl font-bold">{import.meta.env.VITE_STAT_MENTORS || '100+'}</div>
                <div className="text-[10px] lg:text-xs opacity-80">Mentors</div>
              </div>
              <div className="text-center p-2 lg:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-lg lg:text-xl xl:text-2xl font-bold">{import.meta.env.VITE_STAT_MENTEES || '500+'}</div>
                <div className="text-[10px] lg:text-xs opacity-80">Mentees</div>
              </div>
              <div className="text-center p-2 lg:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-lg lg:text-xl xl:text-2xl font-bold">{import.meta.env.VITE_STAT_SUCCESS || '95%'}</div>
                <div className="text-[10px] lg:text-xs opacity-80">Success</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Corner decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 h-36 lg:w-48 lg:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="p-4 sm:p-5 lg:p-6 flex items-center justify-between border-b border-border lg:border-none">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={Logo}
              alt="Eagles & Eaglets"
              className="h-10 sm:h-12 lg:h-14 w-auto rounded-lg shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
            />
          </Link>
          <Link
            to="/register"
            className="px-3 py-2.5 sm:px-4 sm:py-2.5 min-h-[44px] flex items-center lg:px-5 lg:py-2.5 text-xs sm:text-sm font-semibold text-primary border-2 border-primary rounded-lg sm:rounded-xl
              btn-hover-lift hover:bg-primary hover:text-white"
          >
            Sign Up
          </Link>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-sm sm:max-w-md">
            {/* Title */}
            <div className="text-center lg:text-left mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1 sm:mb-2">Welcome Back</h2>
              <p className="text-sm sm:text-base text-text-secondary">Please enter your details to sign in.</p>
            </div>

            {/* State Message (success or session expiry warning) - Auto-dismisses after 5 seconds */}
            {stateMessage && showStateMessage && (
              <Alert
                variant={isSessionExpiry ? 'warning' : 'success'}
                className="mb-4 sm:mb-6 animate-fade-in"
                onClose={() => setShowStateMessage(false)}
              >
                {stateMessage}
              </Alert>
            )}

            {/* Error Alert - With auto-resend for verification errors */}
            {authError && (
              <Alert
                variant={isVerificationError ? 'warning' : 'error'}
                className="mb-4 sm:mb-6 animate-fade-in"
                onClose={clearError}
              >
                <div>
                  {isVerificationError ? (
                    <>
                      <p className="font-medium">Email verification required</p>
                      <div className="mt-2">
                        {resendStatus === 'sending' ? (
                          <p className="text-sm flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                            Sending a new verification email...
                          </p>
                        ) : resendStatus === 'sent' ? (
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            We&apos;ve sent another verification email to your inbox. Please check and verify your account.
                          </p>
                        ) : resendStatus === 'error' ? (
                          <p className="text-sm text-red-700">
                            Failed to send verification email. Please try again later or contact support.
                          </p>
                        ) : (
                          <p className="text-sm">
                            Please check your inbox for the verification link.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p>{authError}</p>
                  )}
                </div>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="group w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-border rounded-lg sm:rounded-xl
                font-semibold text-text-primary text-sm sm:text-base bg-white
                transition-all duration-300 mb-4 sm:mb-6
                hover:border-gray-300 hover:shadow-lg sm:hover:scale-[1.02]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="truncate">
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-background text-text-muted">or sign in with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" autoComplete="on">
              {/* Email */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
                inputMode="email"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              {/* Password */}
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="current-password"
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
                    className="text-text-muted hover:text-text-primary transition-colors focus:outline-none"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
                <Checkbox
                  name="remember_me"
                  checked={formData.remember_me}
                  onChange={handleChange}
                  label="Remember me"
                />
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-medium text-primary link-hover-effect"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                className="btn-hover-lift animate-pulse-glow !py-3 sm:!py-3.5"
              >
                Sign In
              </Button>
            </form>

            {/* Register Link */}
            <p className="text-center text-sm sm:text-base text-text-secondary mt-4 sm:mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary font-semibold link-hover-effect">
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
