import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { profileService } from '../../modules/profile/services/profile-service';
import { Button, Alert } from '@components/ui';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * PendingApprovalPage Component
 * Shown when a user's profile is pending admin approval
 */
const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMentor = user?.role === 'eagle';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = isMentor
          ? await profileService.getMentorProfile()
          : await profileService.getMenteeProfile();

        if (response.success) {
          setProfileData(response.data);

          // If approved, redirect to dashboard
          if (response.data.status === 'approved') {
            navigate('/dashboard');
          }

          // If requires changes, redirect to profile page
          if (response.data.status === 'requires_changes') {
            navigate('/complete-profile');
          }
          // Note: rejected status stays on this page to show rejection message
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isMentor, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (profileData?.status) {
      case 'submitted':
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: (
            <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Profile Submitted',
          message: 'Your profile has been submitted and is waiting to be reviewed.',
        };
      case 'under_review':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: (
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          title: 'Under Review',
          message: 'Our team is currently reviewing your profile. This usually takes 2-3 business days.',
        };
      case 'rejected':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Application Not Approved',
          message: 'Unfortunately, your application was not approved at this time.',
          showReason: true,
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: (
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          title: 'Pending',
          message: 'Your profile is pending review.',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-text-secondary hover:text-error transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 py-16">
        <div className={`${status.bgColor} ${status.borderColor} border rounded-2xl p-8 text-center`}>
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status.icon}
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${status.color} mb-3`}>
            {status.title}
          </h1>

          {/* Message */}
          <p className="text-text-secondary mb-6">
            {status.message}
          </p>

          {/* Rejection Reason - shown only for rejected status */}
          {profileData?.status === 'rejected' && profileData?.rejection_reason && (
            <div className="bg-white rounded-xl p-4 mb-6 text-left border border-red-200">
              <h4 className="font-semibold text-red-700 mb-2">Reason:</h4>
              <p className="text-sm text-text-secondary">
                {profileData.rejection_reason}
              </p>
            </div>
          )}

          {/* User Info Card */}
          <div className="bg-white rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-4">
              {profileData?.display_picture ? (
                <img
                  src={profileData.display_picture}
                  alt={user?.first_name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-text-primary">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-text-muted">
                  {isMentor ? 'Eagle (Mentor)' : 'Eaglet (Mentee)'} Application
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Submitted: {profileData?.submitted_at
                    ? new Date(profileData.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* What to Expect - different content for rejected vs pending */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-text-primary mb-3">
              {profileData?.status === 'rejected' ? 'What can you do?' : 'What happens next?'}
            </h3>
            {profileData?.status === 'rejected' ? (
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Review the reason provided above for your application rejection
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Click "Edit Profile & Reapply" to update your information
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit your updated profile for another review
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Our team will review your profile within 2-3 business days
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You'll receive an email notification once your profile is approved
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  If we need any additional information, we'll reach out via email
                </li>
              </ul>
            )}
          </div>

          {/* Contact Support */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-text-muted">
              Have questions? Contact us at{' '}
              <a href="mailto:support@eaglesneaglets.com" className="text-primary hover:underline">
                support@eaglesneaglets.com
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 text-center space-y-4">
          {/* Edit Profile & Reapply - shown only for rejected status */}
          {profileData?.status === 'rejected' && (
            <Button
              variant="primary"
              onClick={() => navigate('/complete-profile')}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile & Reapply
            </Button>
          )}

          {/* Refresh Status - shown for non-rejected status */}
          {profileData?.status !== 'rejected' && (
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-text-secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default PendingApprovalPage;
