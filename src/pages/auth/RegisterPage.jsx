import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@components/ui';
import { authService } from '../../modules/auth/services/auth-service';
import { logger } from '../../shared/utils/logger';
import RoleStep from './register/RoleStep';
import DetailsForm from './register/DetailsForm';
import EmailVerifySent from './register/EmailVerifySent';
import FloatingShapesBackground from './register/FloatingShapesBackground';

/**
 * RegisterPage — orchestrator only. Owns top-level flow state and composes:
 * RoleStep → DetailsForm (+ Google SSO) → EmailVerifySent result screen,
 * in a single centered column that stays responsive at every breakpoint,
 * with a one-shot animated background mounted on idle so it never competes
 * with form interactivity.
 */
const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [showBg, setShowBg] = useState(false);

  // Mount decorative background on idle — keep first paint focused on the form.
  useEffect(() => {
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = ric(() => setShowBg(true));
    return () => cancel(id);
  }, []);

  const handleSubmit = async (values) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmittedEmail(values.email);
    try {
      const response = await authService.register(values);
      const data = response?.data || response;
      const wasEmailSent = data?.email_sent !== false;
      setEmailSent(wasEmailSent);
      setSuccess(true);
    } catch (err) {
      logger.error('Registration failed:', err);
      setFailed(true);
      setFailureMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async (role) => {
    setIsGoogleLoading(true);
    try {
      const response = await authService.getGoogleAuthUrl(role || '');
      const authUrl = response?.data?.auth_url;
      if (authUrl) {
        const parsed = new URL(authUrl);
        if (parsed.hostname !== 'accounts.google.com' || parsed.protocol !== 'https:') {
          throw new Error('Invalid OAuth redirect URL');
        }
        window.location.href = authUrl;
        return;
      }
      setIsGoogleLoading(false);
    } catch (err) {
      logger.error('Failed to get Google auth URL:', err);
      setIsGoogleLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendError(null);
    try {
      const response = await authService.resendVerification(submittedEmail);
      if (response.success) {
        setResendSuccess(true);
        setEmailSent(true);
      }
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Result screens
  if (failed) {
    return (
      <EmailVerifySent
        failed
        failureMessage={failureMessage}
        onTryAgain={() => { setFailed(false); setFailureMessage(''); }}
      />
    );
  }
  if (success) {
    return (
      <EmailVerifySent
        email={submittedEmail}
        emailSent={emailSent}
        resendSuccess={resendSuccess}
        resendError={resendError}
        isResending={isResending}
        selectedRole={selectedRole}
        onResend={handleResend}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {showBg && <FloatingShapesBackground />}

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo className="h-10 sm:h-12 w-auto rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" width={48} height={48} />
          </Link>
          <Link
            to="/login"
            className="px-4 py-2.5 sm:px-5 min-h-[44px] flex items-center text-xs sm:text-sm font-semibold text-primary border-2 border-primary rounded-full hover:bg-primary hover:text-white transition-colors duration-200"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main — single centered column, responsive at every breakpoint */}
      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary mb-1 sm:mb-2">
            {selectedRole
              ? (selectedRole === 'eagle' ? 'Register as a Mentor' : 'Register as a Mentee')
              : <>Join the <span className="text-primary">Flight</span></>}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary px-2">
            {selectedRole
              ? (selectedRole === 'eagle' ? 'Share your experience and guide the next generation' : 'Start your mentorship journey and grow with guidance')
              : 'Choose your path and start your mentorship journey today.'}
          </p>
        </div>

        <div className={selectedRole ? 'mb-6' : 'mb-0'}>
          <RoleStep
            selectedRole={selectedRole}
            onSelect={setSelectedRole}
            onChangeRole={() => setSelectedRole('')}
          />
        </div>

        {selectedRole && (
          <DetailsForm
            selectedRole={selectedRole}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            onGoogle={handleGoogle}
            isGoogleLoading={isGoogleLoading}
          />
        )}

        <p className="text-center text-sm text-text-secondary mt-4 sm:mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>

        <p className="text-center text-xs sm:text-sm text-text-muted mt-6 sm:mt-8 pb-4">
          &copy; {new Date().getFullYear()} Eagles &amp; Eaglets. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default RegisterPage;
