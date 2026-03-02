import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@store';
import { authService } from '../../modules/auth/services/auth-service';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * GoogleCallbackPage Component
 * Handles the OAuth callback from Google
 */
const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution (React StrictMode runs effects twice)
      // Google auth codes are single-use, so we must only process once
      if (hasProcessed.current) {
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state'); // Contains the role
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google sign-in was cancelled or failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google.');
        setIsProcessing(false);
        return;
      }

      // Mark as processed before making the API call
      hasProcessed.current = true;

      try {
        const response = await authService.googleCallback(code, state || 'eaglet');

        if (response.success) {
          const { access, refresh, user } = response.data;

          // Store auth data
          setAuth({
            accessToken: access,
            refreshToken: refresh,
            user,
          });

          // Store tokens in localStorage
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);

          // Redirect based on user role and status
          const isAdmin = user.is_staff || user.is_superuser || user.role === 'admin';

          if (isAdmin) {
            navigate('/admin/dashboard', { replace: true });
          } else if (user.role === 'eagle') {
            if (user.kyc_status === 'draft' || !user.kyc_status) {
              navigate('/mentor-profile', { replace: true });
            } else if (user.kyc_status === 'submitted' || user.kyc_status === 'under_review') {
              navigate('/pending-approval', { replace: true });
            } else if (user.kyc_status === 'requires_changes' || user.kyc_status === 'rejected') {
              navigate('/mentor-profile', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } else if (user.role === 'eaglet') {
            // Eaglet users - check KYC status (Eaglets now require admin approval)
            if (!user.kyc_status || user.kyc_status === 'draft') {
              navigate('/mentee-profile', { replace: true });
            } else if (user.kyc_status === 'submitted' || user.kyc_status === 'under_review') {
              navigate('/pending-approval', { replace: true });
            } else if (user.kyc_status === 'requires_changes') {
              navigate('/mentee-profile', { replace: true });
            } else if (user.kyc_status === 'approved') {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setError(response.error?.message || 'Failed to authenticate with Google.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setError(err.message || 'An error occurred during authentication.');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={Logo} alt="Eagles & Eaglets" className="h-12 w-auto" />
          </div>

          {isProcessing ? (
            <>
              {/* Loading State */}
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Signing you in...
              </h2>
              <p className="text-text-secondary">
                Please wait while we complete your Google sign-in.
              </p>
            </>
          ) : (
            <>
              {/* Error State */}
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Sign-in Failed
              </h2>
              <p className="text-text-secondary mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-3 border border-border text-text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
