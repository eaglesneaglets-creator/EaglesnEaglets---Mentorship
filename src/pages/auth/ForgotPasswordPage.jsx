import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert } from '@components/ui';
import { forgotPasswordSchema } from '../../modules/auth/schemas/register-schema';
import { authService } from '../../modules/auth/services/auth-service';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

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

    // Validate
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      // Zod v3+ uses 'issues' instead of 'errors'
      const issues = result.error?.issues || result.error?.errors || [];
      setError(issues[0]?.message || 'Validation failed');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setIsSubmitted(true);
    } catch {
      // Don't reveal if email exists or not
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
          </Link>
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-dark">
            Back to Login
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-border p-8">
          {!isSubmitted ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Forgot Password?</h2>
                <p className="text-text-secondary">
                  No worries, we&apos;ll send you reset instructions.
                </p>
              </div>

              {/* Error */}
              {error && (
                <Alert
                  variant="error"
                  className="mb-4 animate-fade-in"
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                  Reset Password
                </Button>
              </form>

              {/* Back to Login */}
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary mt-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to login
              </Link>
            </>
          ) : (
            <>
              {/* Success State */}
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
                onClick={() => setIsSubmitted(false)}
                className="w-full text-center text-sm text-text-secondary hover:text-primary mt-4"
              >
                Didn&apos;t receive the email? Click to resend
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
