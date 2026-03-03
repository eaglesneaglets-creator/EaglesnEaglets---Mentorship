import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Alert } from '@components/ui';
import { authService } from '../../modules/auth/services/auth-service';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * VerifyEmailPage Component
 * Handles email verification with token
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double verification (React StrictMode runs effects twice)
      if (hasVerified.current) {
        return;
      }

      if (!token) {
        setStatus('error');
        setError('No verification token provided.');
        return;
      }

      hasVerified.current = true;

      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        // Check if error indicates already verified
        const errorMessage = err.message || '';
        if (errorMessage.toLowerCase().includes('already verified')) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(errorMessage || 'Email verification failed. The link may have expired.');
        }
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Verifying Your Email</h2>
              <p className="text-text-secondary">Please wait while we verify your email address...</p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Email Verified!</h2>
              <p className="text-text-secondary mb-6">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <Link to="/login">
                <Button variant="primary" fullWidth>
                  Continue to Login
                </Button>
              </Link>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Verification Failed</h2>
              <Alert variant="error" className="mb-6 text-left animate-fade-in">
                {error}
              </Alert>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="primary" fullWidth>
                    Go to Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" fullWidth>
                    Create New Account
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;
