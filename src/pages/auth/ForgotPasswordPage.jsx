import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert } from '@components/ui';
import AuthFormShell from '../../modules/auth/components/AuthFormShell';
import AuthFormIntro from '../../modules/auth/components/AuthFormIntro';
import BackToLoginLink from '../../modules/auth/components/BackToLoginLink';
import { forgotPasswordSchema } from '../../modules/auth/schemas/register-schema';
import { authService } from '../../modules/auth/services/auth-service';

const KeyIcon = () => (
  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

/**
 * ForgotPasswordPage Component
 * Password reset request page
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const issues = result.error?.issues || result.error?.errors || [];
      setError(issues[0]?.message || 'Validation failed');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormShell
      headerAction={(
        <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-dark">
          Back to Login
        </Link>
      )}
    >
      {!isSubmitted ? (
        <>
          <AuthFormIntro
            icon={<KeyIcon />}
            title="Forgot Password?"
            description="No worries, we'll send you reset instructions."
            error={error}
            onErrorDismiss={() => setError('')}
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
              Reset Password
            </Button>
          </form>

          <BackToLoginLink />
        </>
      ) : (
        <>
          <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Check your email</h2>
            <p className="text-text-secondary">
              We sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          <Alert variant="info" className="mb-6">
            If an account exists for this email, you will receive a password reset link shortly.
          </Alert>
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Back to Login
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="w-full text-center text-sm text-text-secondary hover:text-primary mt-4"
          >
            Didn&apos;t receive the email? Click to resend
          </button>
        </>
      )}
    </AuthFormShell>
  );
};

export default ForgotPasswordPage;
