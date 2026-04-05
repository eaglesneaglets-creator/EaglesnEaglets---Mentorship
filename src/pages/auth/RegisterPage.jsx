import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { Button, Input, Checkbox, Alert } from '@components/ui';
import { registerSchema } from '../../modules/auth/schemas/register-schema';
import { authService } from '../../modules/auth/services/auth-service';
import { logger } from '../../shared/utils/logger';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * RegisterPage Component
 * Registration page with role-first selection, animated forms, and dynamic background
 */

// Floating shape component for background animation
const FloatingShape = ({ delay, duration, left, top, size, type }) => {
  const shapes = {
    circle: (
      <div
        className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5"
        style={{ width: size, height: size }}
      />
    ),
    ring: (
      <div
        className="rounded-full border-2 border-primary/10"
        style={{ width: size, height: size }}
      />
    ),
    feather: (
      <svg
        className="text-primary/10"
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.12 6.71c-2.15-2.15-5.64-2.15-7.79 0l-2.12 2.12c-.59.59-.59 1.54 0 2.12.59.59 1.54.59 2.12 0l2.12-2.12c.98-.98 2.56-.98 3.54 0 .98.98.98 2.56 0 3.54l-6.36 6.36c-.98.98-2.56.98-3.54 0-.98-.98-.98-2.56 0-3.54l.71-.71c.59-.59.59-1.54 0-2.12-.59-.59-1.54-.59-2.12 0l-.71.71c-2.15 2.15-2.15 5.64 0 7.79 2.15 2.15 5.64 2.15 7.79 0l6.36-6.36c2.15-2.15 2.15-5.64 0-7.79z" />
      </svg>
    ),
    star: (
      <svg
        className="text-primary/8"
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };

  return (
    <div
      className="absolute animate-float-drift pointer-events-none"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      {shapes[type]}
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { error: authError, clearError } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    role: '',
    terms_accepted: false,
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [emailSent, setEmailSent] = useState(false); // H20: default false — set to true only after API confirms email_sent
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);

  // Show form with animation after role selection
  useEffect(() => {
    if (selectedRole) {
      // Small delay for smooth animation
      const timer = setTimeout(() => {
        setShowForm(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowForm(false);
    }
  }, [selectedRole]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when field changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
    if (authError) {
      clearError?.();
    }
  };

  const handleBackToRoles = () => {
    setSelectedRole('');
    setShowForm(false);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      password: '',
      password_confirm: '',
      role: '',
      terms_accepted: false,
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Validate form data
    const result = registerSchema.safeParse(formData);
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

    setIsSubmitting(true);

    try {
      // Use authService directly instead of the store's register()
      // to avoid setting store.isLoading, which causes GuestGuard
      // to unmount this page and reset all local state.
      const response = await authService.register(formData);
      const data = response?.data || response;
      setSuccess(true);

      // Check if email was sent successfully
      const wasEmailSent = data?.email_sent !== false;
      setEmailSent(wasEmailSent);

      // Start countdown for auto-redirect if email was sent
      if (wasEmailSent) {
        setCountdown(5);
      }
    } catch (err) {
      logger.error('Registration failed:', err);
      setRegistrationFailed(true);
      setFailureMessage(
        err?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const response = await authService.resendVerification(formData.email);
      if (response.success) {
        setResendSuccess(true);
        setEmailSent(true);
        // Start countdown for redirect after successful resend
        setCountdown(3);
      }
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle "Try Again" from failure screen
  const handleTryAgain = () => {
    setRegistrationFailed(false);
    setFailureMessage('');
    clearError?.();
  };

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown === 0) {
      const message = resendSuccess
        ? 'Verification email sent. Please check your inbox.'
        : 'Please check your email to verify your account.';
      navigate('/login', { state: { message } });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate, resendSuccess]);

  // Failure state - show full-screen error result
  if (registrationFailed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Failure animation styles */}
        <style>{`
          @keyframes failure-pop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes x-draw {
            0% { stroke-dashoffset: 30; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 50%, 90% { transform: translateX(-4px); }
            30%, 70% { transform: translateX(4px); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.15); opacity: 0; }
            100% { transform: scale(1); opacity: 0; }
          }
          .animate-failure-pop {
            animation: failure-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-x-draw {
            stroke-dasharray: 30;
            stroke-dashoffset: 30;
            animation: x-draw 0.4s ease-out 0.3s forwards;
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out 0.6s;
          }
          .animate-pulse-ring {
            animation: pulse-ring 2s ease-out infinite;
          }
        `}</style>

        {/* Subtle red gradient accents */}
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-64 h-64 sm:w-80 sm:h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.07) 0%, transparent 70%)' }}
        />

        <div className="max-w-md w-full text-center relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border animate-failure-pop">
            {/* Animated error icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              {/* Pulse ring behind icon */}
              <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse-ring" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center animate-shake">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    className="animate-x-draw"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6"
                  />
                  <path
                    className="animate-x-draw"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 6l12 12"
                    style={{ animationDelay: '0.45s' }}
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Registration Failed
            </h2>

            <p className="text-text-secondary mb-6">
              We couldn&apos;t create your account. Please review the error below and try again.
            </p>

            {/* Error message card */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">What went wrong</p>
                  <p className="text-sm text-red-700 mt-1">{failureMessage}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleTryAgain}
                className="btn-hover-lift"
              >
                Try Again
              </Button>

              <Link to="/login">
                <Button
                  variant="secondary"
                  fullWidth
                  className="btn-hover-lift mt-3"
                >
                  Go to Login
                </Button>
              </Link>
            </div>

            <p className="text-xs text-text-muted mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Success animation styles */}
        <style>{`
          @keyframes success-pop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes checkmark-draw {
            0% { stroke-dashoffset: 50; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes countdown-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          .animate-success-pop {
            animation: success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-checkmark {
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
            animation: checkmark-draw 0.5s ease-out 0.3s forwards;
          }
          .confetti {
            animation: confetti-fall linear forwards;
          }
          .countdown-number {
            animation: countdown-pulse 1s ease-in-out infinite;
          }
        `}</style>

        {/* Confetti effect - only show if email was sent */}
        {emailSent && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti absolute w-3 h-3 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              backgroundColor: ['#22C55E', '#16A34A', '#86EFAC', '#FFD700', '#3B82F6'][i % 5],
              animationDuration: `${2 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}

        <div className="max-w-md w-full text-center relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border animate-success-pop">
            {/* Icon changes based on email status */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${emailSent
              ? 'bg-gradient-to-br from-success/20 to-success/10'
              : 'bg-gradient-to-br from-amber-100 to-amber-50'
              }`}>
              {emailSent ? (
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    className="animate-checkmark"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {emailSent ? 'Account Created Successfully!' : 'Account Created!'}
            </h2>

            {/* Email sent successfully */}
            {emailSent && !resendSuccess && (
              <p className="text-text-secondary mb-6">
                We&apos;ve sent a verification email to <strong className="text-primary">{formData.email}</strong>.
                Please check your inbox and click the link to verify your account.
              </p>
            )}

            {/* Email failed to send */}
            {!emailSent && !resendSuccess && (
              <>
                <p className="text-text-secondary mb-4">
                  Your account has been created, but we couldn&apos;t send the verification email to <strong className="text-primary">{formData.email}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Verification Email Required</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Please click the button below to resend the verification email.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Resend successful */}
            {resendSuccess && (
              <p className="text-text-secondary mb-6">
                Verification email sent successfully to <strong className="text-primary">{formData.email}</strong>.
                Redirecting you to login...
              </p>
            )}

            {/* Resend error */}
            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to Send</p>
                    <p className="text-sm text-red-700 mt-1">{resendError}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'eagle' && emailSent && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-amber-800">
                  After verification, you&apos;ll need to complete our KYC process before accessing the platform.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Resend button - show when email failed and not yet resent successfully */}
              {!emailSent && !resendSuccess && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleResendEmail}
                  loading={isResending}
                  className="btn-hover-lift"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              )}

              {/* Go to login button */}
              <Link to="/login">
                <Button
                  variant={emailSent || resendSuccess ? 'primary' : 'secondary'}
                  fullWidth
                  className="btn-hover-lift"
                >
                  Go to Login
                </Button>
              </Link>
            </div>

            {/* Auto-redirect countdown */}
            {(emailSent || resendSuccess) && countdown !== null && countdown > 0 && (
              <div className="mt-5">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <p className="text-sm text-text-secondary">
                    Redirecting to login in <span className="font-bold text-primary countdown-number inline-block">{countdown}</span> {countdown === 1 ? 'second' : 'seconds'}...
                  </p>
                </div>
              </div>
            )}
            {(emailSent || resendSuccess) && countdown === 0 && (
              <p className="text-xs text-text-muted mt-4">
                Redirecting now...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* CSS for animations */}
      <style>{`
        @keyframes float-drift {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(-3deg);
          }
          75% {
            transform: translateY(-25px) translateX(5px) rotate(3deg);
          }
        }
        @keyframes gradient-move {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-float-drift {
          animation: float-drift ease-in-out infinite;
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 15s ease infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 4s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .card-hover {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (hover: hover) {
          .card-hover:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px -15px rgba(34, 197, 94, 0.3);
          }
        }
        .card-hover:active {
          transform: translateY(-2px) scale(0.98);
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
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        @media (min-width: 640px) {
          .glass-effect {
            background: rgba(255, 255, 255, 0.8);
          }
        }
        /* Reduce animations on mobile for performance */
        @media (max-width: 640px) {
          .animate-float-drift {
            animation: none;
          }
          .animate-pulse-soft {
            animation: none;
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Animated Background Elements - Hidden on small screens for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient orbs - Smaller on mobile */}
        <div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 60%)',
            animationDelay: '1s',
          }}
        />

        {/* Floating shapes - Hidden on mobile, reduced on tablet */}
        <div className="hidden sm:block">
          <FloatingShape delay={0} duration={20} left={5} top={15} size={40} type="circle" />
          <FloatingShape delay={2} duration={25} left={85} top={10} size={30} type="ring" />
          <FloatingShape delay={4} duration={18} left={15} top={70} size={25} type="feather" />
          <FloatingShape delay={6} duration={22} left={75} top={60} size={35} type="circle" />
        </div>
        <div className="hidden lg:block">
          <FloatingShape delay={8} duration={28} left={45} top={85} size={35} type="star" />
          <FloatingShape delay={1} duration={24} left={90} top={40} size={45} type="ring" />
          <FloatingShape delay={3} duration={19} left={25} top={35} size={25} type="feather" />
          <FloatingShape delay={5} duration={21} left={60} top={20} size={55} type="circle" />
          <FloatingShape delay={7} duration={26} left={10} top={50} size={40} type="star" />
          <FloatingShape delay={9} duration={23} left={50} top={5} size={30} type="ring" />
        </div>

        {/* Subtle grid pattern overlay - Hidden on mobile */}
        <div
          className="hidden sm:block absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={Logo}
              alt="Eagles & Eaglets"
              className="h-10 sm:h-12 lg:h-14 w-auto rounded-lg shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
            />
          </Link>
          <Link
            to="/login"
            className="px-3 py-2.5 sm:px-4 sm:py-2.5 min-h-[44px] flex items-center lg:px-5 lg:py-2.5 text-xs sm:text-sm font-semibold text-primary border-2 border-primary rounded-lg sm:rounded-xl
              btn-hover-lift hover:bg-primary hover:text-white"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-1 sm:mb-2">
            {selectedRole ? (
              selectedRole === 'eagle' ? 'Register as a Mentor' : 'Register as a Mentee'
            ) : (
              <>
                Join the{' '}
                <span className="text-primary relative">
                  Flight
                  <span className="absolute -bottom-0.5 sm:-bottom-1 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
                </span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary px-2">
            {selectedRole ? (
              selectedRole === 'eagle'
                ? 'Share your experience and guide the next generation'
                : 'Start your mentorship journey and grow with guidance'
            ) : (
              'Choose your path and start your mentorship journey today.'
            )}
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <Alert
            variant="error"
            className="mb-6 animate-fade-in"
            onClose={clearError}
          >
            {authError}
          </Alert>
        )}

        {/* Role Selection - Always visible but changes when selected */}
        <div className={`transition-all duration-500 ease-out ${selectedRole ? 'mb-6' : 'mb-0'}`}>
          {!selectedRole ? (
            /* Full Role Selection Cards */
            <div className="glass-effect rounded-xl sm:rounded-2xl shadow-lg border border-border/50 p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-4 sm:mb-6 text-center">
                Choose your path
                <span className="block text-xs sm:text-sm font-normal text-text-muted mt-1">Select the role that best describes you</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Eagle Role */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('eagle')}
                  className="group relative flex flex-col items-start p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border-2 text-left
                    card-hover border-border bg-white overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon with animation */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary sm:animate-bounce-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>

                  <h3 className="relative font-bold text-text-primary text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
                    I am an Eagle
                  </h3>
                  <p className="relative text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                    I have experience to share. I want to guide the next generation and help them soar.
                  </p>
                  <span className="relative inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-primary font-medium px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 rounded-full">
                    Mentor • Leader • Guide
                  </span>

                  {/* Arrow indicator - Hidden on mobile */}
                  <div className="hidden sm:flex absolute bottom-4 right-4 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Eaglet Role */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('eaglet')}
                  className="group relative flex flex-col items-start p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border-2 text-left
                    card-hover border-border bg-white overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon with animation */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary sm:animate-bounce-subtle" style={{ animationDelay: '0.5s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  <h3 className="relative font-bold text-text-primary text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
                    I am an Eaglet
                  </h3>
                  <p className="relative text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                    I am ready to learn. I&apos;m looking for guidance to help me grow and navigate my path.
                  </p>
                  <span className="relative inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-primary font-medium px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 rounded-full">
                    Mentee • Learner • Growing
                  </span>

                  {/* Arrow indicator - Hidden on mobile */}
                  <div className="hidden sm:flex absolute bottom-4 right-4 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Compact Role Badge with Change Option */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/30 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {selectedRole === 'eagle' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                    Registering as {selectedRole === 'eagle' ? 'an Eagle (Mentor)' : 'an Eaglet (Mentee)'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-text-secondary">
                    {selectedRole === 'eagle'
                      ? 'KYC verification required after registration'
                      : 'Optional profile setup after registration'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBackToRoles}
                className="self-end sm:self-auto text-xs sm:text-sm font-medium text-primary link-hover-effect px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-primary/10 transition-colors duration-200"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Registration Form - Animated appearance */}
        <div
          className={`
            transition-all duration-500 ease-out overflow-hidden
            ${showForm ? 'opacity-100 max-h-[2000px] translate-y-0' : 'opacity-0 max-h-0 translate-y-4'}
          `}
        >
          <form onSubmit={handleSubmit} className="glass-effect rounded-xl sm:rounded-2xl shadow-lg border border-border/50 p-4 sm:p-6 lg:p-8" autoComplete="on">
            <div className="space-y-4 sm:space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  required
                  autoComplete="given-name"
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  required
                  autoComplete="family-name"
                />
              </div>

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

              {/* Phone - Required for Eagles, Optional for Eaglets */}
              <Input
                label={selectedRole === 'eagle' ? 'Phone Number' : 'Phone Number (Optional)'}
                name="phone_number"
                type="tel"
                placeholder="+233543688169"
                value={formData.phone_number}
                onChange={handleChange}
                error={errors.phone_number}
                hint={selectedRole === 'eagle' ? 'Required for mentor verification' : 'phone number'}
                required={selectedRole === 'eagle'}
                autoComplete="tel"
                inputMode="tel"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />

              {/* Password */}
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="new-password"
                hint="Min 10 chars, uppercase, lowercase, number, special character"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                name="password_confirm"
                type="password"
                placeholder="Confirm your password"
                value={formData.password_confirm}
                onChange={handleChange}
                error={errors.password_confirm}
                required
                autoComplete="new-password"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Role-specific info box */}
              {selectedRole === 'eagle' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-amber-800">Mentor Verification Required</p>
                      <p className="text-xs sm:text-sm text-amber-700 mt-0.5 sm:mt-1">
                        After registration, you&apos;ll complete a 4-step KYC verification to ensure the safety of our mentees.
                        This includes identity verification, ministry background, and experience details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'eaglet' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-800">Quick Start</p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-0.5 sm:mt-1">
                        After verifying your email, you can immediately start exploring mentors.
                        We&apos;ll ask a few optional questions to match you with the right mentors.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <Checkbox
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                label={
                  <>
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    {selectedRole === 'eagle' && (
                      <>, and the <a href="#" className="text-primary hover:underline">Mentor Code of Conduct</a></>
                    )}
                  </>
                }
                error={errors.terms_accepted}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                className="btn-hover-lift !py-3 sm:!py-3.5"
              >
                {selectedRole === 'eagle' ? 'Create Mentor Account' : 'Create Account'}
              </Button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm sm:text-base text-text-secondary mt-4 sm:mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold link-hover-effect">
                Log in
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-text-muted mt-6 sm:mt-8 pb-4">
          &copy; {new Date().getFullYear()} Eagles & Eaglets. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default RegisterPage;
