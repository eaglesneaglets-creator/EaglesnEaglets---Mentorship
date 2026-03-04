import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@store';
import { Button, Alert } from '@components/ui';
import { kycService } from '../../modules/auth/services/auth-service';
import { logger } from '../../shared/utils/logger';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * KYCPendingPage Component
 * Shows application status while under review
 */
const KYCPendingPage = () => {
  const { user, logout } = useAuthStore();
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadKYC = async () => {
      try {
        const response = await kycService.getKYC();
        if (response.success) {
          setKycData(response.data);
        }
      } catch (err) {
        logger.error('Failed to load KYC status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadKYC();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'submitted':
        return {
          title: 'Application Submitted',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          message: 'Your application has been received.',
        };
      case 'under_review':
        return {
          title: 'Under Review',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          message: 'Our team is currently reviewing your application.',
        };
      case 'approved':
        return {
          title: 'Approved',
          color: 'text-success',
          bgColor: 'bg-success/10',
          message: 'Congratulations! Your application has been approved.',
        };
      case 'rejected':
        return {
          title: 'Not Approved',
          color: 'text-error',
          bgColor: 'bg-error/10',
          message: 'Unfortunately, your application was not approved at this time.',
        };
      default:
        return {
          title: 'Pending',
          color: 'text-text-secondary',
          bgColor: 'bg-gray-100',
          message: 'Your application status is pending.',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const _StatusInfo = kycData ? getStatusInfo(kycData.status) : getStatusInfo('pending');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-text-secondary hover:text-error"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          {/* Eagle Image Placeholder */}
          <div className="w-64 h-48 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <svg className="w-24 h-24 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-3">
            Your Journey is Taking Flight
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Our team is carefully reviewing your application to ensure the best fit for our Eaglets.
            This usually takes 2-3 business days.
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-8">
          <div className="space-y-6">
            {/* Step 1: Submitted */}
            <div className="flex items-start gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${kycData?.submitted_at ? 'bg-success text-white' : 'bg-gray-200 text-text-muted'}
              `}>
                {kycData?.submitted_at ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>1</span>
                )}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold text-text-primary">Application Submitted</h3>
                {kycData?.submitted_at && (
                  <p className="text-sm text-text-secondary">
                    Completed on {new Date(kycData.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Connector */}
            <div className="ml-5 border-l-2 border-border h-4" />

            {/* Step 2: Under Review */}
            <div className="flex items-start gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${kycData?.status === 'under_review' || kycData?.status === 'approved'
                  ? 'bg-warning text-white'
                  : 'bg-gray-200 text-text-muted'
                }
              `}>
                {kycData?.status === 'approved' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>2</span>
                )}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold text-text-primary">Verification in Progress</h3>
                <p className="text-sm text-text-secondary">
                  {kycData?.status === 'under_review'
                    ? 'Currently being reviewed'
                    : kycData?.status === 'approved'
                      ? 'Completed'
                      : 'Est. 2-3 Days'}
                </p>
              </div>
            </div>

            {/* Connector */}
            <div className="ml-5 border-l-2 border-border h-4" />

            {/* Step 3: Decision */}
            <div className="flex items-start gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${kycData?.status === 'approved'
                  ? 'bg-success text-white'
                  : kycData?.status === 'rejected'
                    ? 'bg-error text-white'
                    : 'bg-gray-200 text-text-muted'
                }
              `}>
                {kycData?.status === 'approved' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : kycData?.status === 'rejected' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <span>3</span>
                )}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold text-text-primary">Approval Decision</h3>
                <p className="text-sm text-text-secondary">
                  {kycData?.status === 'approved'
                    ? 'You\'ve been approved!'
                    : kycData?.status === 'rejected'
                      ? 'Review the feedback below'
                      : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Alert */}
        {kycData?.status === 'rejected' && kycData?.rejection_reason && (
          <Alert variant="error" className="mb-6">
            <strong>Feedback:</strong> {kycData.rejection_reason}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {kycData?.status === 'approved' ? (
            <Link to="/dashboard" className="flex-1">
              <Button variant="primary" fullWidth>
                Go to Dashboard
              </Button>
            </Link>
          ) : kycData?.status === 'rejected' || kycData?.status === 'requires_changes' ? (
            <Link to="/kyc" className="flex-1">
              <Button variant="primary" fullWidth>
                Update Application
              </Button>
            </Link>
          ) : (
            <Button variant="primary" fullWidth disabled>
              Awaiting Review
            </Button>
          )}
          <a
            href="mailto:support@eaglesneaglets.com"
            className="flex-1"
          >
            <Button variant="outline" fullWidth>
              Contact Support
            </Button>
          </a>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 text-sm text-text-muted">
          <a href="#" className="hover:text-primary">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-primary">Terms of Service</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-primary">Cookie Policy</a>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-text-muted mt-4">
          &copy; {new Date().getFullYear()} Eagles & Eaglets Ministry. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default KYCPendingPage;
