import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button } from '@components/ui';

/**
 * EmailVerifySent — post-submit result screen. Handles BOTH outcomes:
 *  - failed: registration API errored (Try Again / Go to Login)
 *  - success: account created (email sent → verify, or email failed → resend)
 *
 * Extracted from RegisterPage so the orchestrator stays thin. Emerald theme
 * for success, red accents for failure — consistent with the rest of auth.
 */
const EmailVerifySent = ({
  failed,
  failureMessage,
  email,
  emailSent,
  resendSuccess,
  resendError,
  isResending,
  selectedRole,
  onResend,
  onTryAgain,
}) => {
  if (failed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Registration Failed</h2>
            <p className="text-text-secondary mb-6">We couldn&apos;t create your account. Review the error and try again.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800">What went wrong</p>
              <p className="text-sm text-red-700 mt-1">{failureMessage}</p>
            </div>
            <div className="space-y-3">
              <Button variant="primary" fullWidth onClick={onTryAgain} className="!rounded-full">Try Again</Button>
              <Link to="/login"><Button variant="secondary" fullWidth className="!rounded-full mt-3">Go to Login</Button></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${emailSent ? 'bg-gradient-to-br from-emerald-100 to-emerald-50' : 'bg-gradient-to-br from-amber-100 to-amber-50'}`}>
            {emailSent ? (
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
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

          {emailSent && !resendSuccess && (
            <p className="text-text-secondary mb-6">
              We&apos;ve sent a verification email to <strong className="text-primary">{email}</strong>. Check your inbox and click the link to verify your account.
            </p>
          )}

          {!emailSent && !resendSuccess && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-amber-800">Verification Email Required</p>
              <p className="text-sm text-amber-700 mt-1">
                Your account was created but we couldn&apos;t email <strong>{email}</strong>. Resend below.
              </p>
            </div>
          )}

          {resendSuccess && (
            <p className="text-text-secondary mb-6">
              Verification email re-sent to <strong className="text-primary">{email}</strong>. Check your inbox.
            </p>
          )}

          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800">Failed to Send</p>
              <p className="text-sm text-red-700 mt-1">{resendError}</p>
            </div>
          )}

          {selectedRole === 'eagle' && emailSent && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                After verification, complete the KYC process before accessing the platform.
              </p>
            </div>
          )}

          {/* Resend stays here — the login page has no resend control, so this
              screen is the only reliable place to retry the verification email.
              Available until a resend succeeds. */}
          <div className="space-y-3">
            {!resendSuccess && (
              <Button variant="primary" fullWidth onClick={onResend} loading={isResending} className="!rounded-full">
                {isResending ? 'Sending…' : 'Resend Verification Email'}
              </Button>
            )}
            <Link to="/login">
              <Button variant={resendSuccess ? 'primary' : 'secondary'} fullWidth className="!rounded-full">Go to Login</Button>
            </Link>
          </div>

          {!resendSuccess && (
            <p className="text-xs text-text-muted mt-4">
              Didn&apos;t get the email? Check spam, or resend above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

EmailVerifySent.propTypes = {
  failed: PropTypes.bool,
  failureMessage: PropTypes.string,
  email: PropTypes.string,
  emailSent: PropTypes.bool,
  resendSuccess: PropTypes.bool,
  resendError: PropTypes.string,
  isResending: PropTypes.bool,
  selectedRole: PropTypes.string,
  onResend: PropTypes.func,
  onTryAgain: PropTypes.func,
};

export default EmailVerifySent;
