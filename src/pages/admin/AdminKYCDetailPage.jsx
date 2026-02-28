import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button } from '@components/ui';
import { adminService } from '../../modules/auth/services/auth-service';
import { sanitizeToText } from '../../shared/utils/sanitize';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

// Get the backend base URL (without /api/v1)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = API_BASE_URL.replace('/api/v1', '');

// SVG Icons Component
const Icons = {
  arrowLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  church: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  verified: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  externalLink: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  checkCircle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  edit: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  cancel: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  note: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  timeline: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

/**
 * AdminKYCDetailPage Component
 * Professional KYC review interface with clean design
 */
const AdminKYCDetailPage = () => {
  const { kycId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'mentor'; // Default to mentor for backwards compatibility

  const [kyc, setKyc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Action states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('personal');

  // Document viewer modal
  const [documentViewer, setDocumentViewer] = useState({ isOpen: false, url: '', title: '' });

  // Determine if this is a mentor or mentee application
  const isMentor = roleParam === 'mentor' || roleParam === 'eagle';
  const isMentee = roleParam === 'mentee' || roleParam === 'eaglet';

  // Fetch KYC details
  const fetchKYC = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await adminService.getKYCDetail(kycId, roleParam);
      if (response.success) {
        setKyc(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [kycId, roleParam]);

  useEffect(() => {
    fetchKYC();
  }, [fetchKYC]);

  // Handle approve
  const handleApprove = async () => {
    setIsApproving(true);
    setError('');
    try {
      const response = await adminService.approveKYC(kycId, roleParam, { review_notes: reviewNotes });
      if (response.success) {
        setSuccessMessage('Application approved successfully!');
        setKyc(response.data);
        setTimeout(() => navigate('/admin/kyc'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve application');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    setIsRejecting(true);
    setError('');
    try {
      const response = await adminService.rejectKYC(kycId, roleParam, {
        rejection_reason: rejectionReason,
        review_notes: reviewNotes,
      });
      if (response.success) {
        setSuccessMessage('Application rejected. Applicant has been notified.');
        setKyc(response.data);
        setShowRejectModal(false);
        setTimeout(() => navigate('/admin/kyc'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reject application');
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle request changes
  const handleRequestChanges = async () => {
    if (!reviewNotes.trim()) {
      setError('Please provide details about required changes');
      return;
    }
    setIsRequestingChanges(true);
    setError('');
    try {
      const response = await adminService.requestKYCChanges(kycId, roleParam, {
        review_notes: reviewNotes,
      });
      if (response.success) {
        setSuccessMessage('Changes requested. Applicant has been notified.');
        setKyc(response.data);
        setShowChangesModal(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to request changes');
    } finally {
      setIsRequestingChanges(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      submitted: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Submitted' },
      under_review: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Under Review' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
      requires_changes: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Changes Required' },
    };
    return configs[status] || configs.draft;
  };

  // Tabs based on role
  const mentorTabs = [
    { id: 'personal', label: 'Personal', icon: Icons.user },
    { id: 'ministry', label: 'Ministry', icon: Icons.church },
    { id: 'experience', label: 'Professional', icon: Icons.briefcase },
    { id: 'consent', label: 'Consent', icon: Icons.shield },
  ];

  const menteeTabs = [
    { id: 'personal', label: 'Personal', icon: Icons.user },
    { id: 'professional', label: 'Professional', icon: Icons.briefcase },
    { id: 'about', label: 'About', icon: Icons.note },
    { id: 'preferences', label: 'Preferences', icon: Icons.shield },
  ];

  const tabs = isMentor ? mentorTabs : menteeTabs;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <aside className="w-64 min-h-screen bg-[#1a2e4a] fixed left-0 top-0" />

          {/* Main Content Skeleton */}
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-64" />
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                    <div className="space-y-3 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-48" />
                      <div className="h-4 bg-gray-200 rounded w-64" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm h-96" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!kyc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center max-w-md">
          <div className="text-red-400 mb-6">{Icons.error}</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-500 mb-8">The requested KYC application could not be found.</p>
          <Link to="/admin/kyc">
            <Button variant="primary">Back to Applications</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canTakeAction = kyc.status === 'submitted' || kyc.status === 'under_review';
  const statusConfig = getStatusConfig(kyc.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-emerald-50/50 rounded-full blur-3xl" />
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#1a2e4a] fixed left-0 top-0 shadow-xl">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/admin" className="flex items-center gap-3">
              <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-10 rounded-xl shadow-lg" />
              <div>
                <h1 className="text-white font-semibold">Admin Portal</h1>
                <p className="text-white/50 text-xs">Eagles & Eaglets</p>
              </div>
            </Link>
          </div>

          {/* Back Navigation */}
          <nav className="p-4">
            <Link
              to="/admin/kyc"
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              {Icons.arrowLeft}
              <span className="font-medium">Back to List</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-screen">
          <div className="max-w-6xl mx-auto p-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link to="/admin" className="text-gray-500 hover:text-emerald-600 transition-colors">
                    Admin
                  </Link>
                </li>
                <li className="text-gray-400">{Icons.chevronRight}</li>
                <li>
                  <Link to="/admin/kyc" className="text-gray-500 hover:text-emerald-600 transition-colors">
                    KYC Reviews
                  </Link>
                </li>
                <li className="text-gray-400">{Icons.chevronRight}</li>
                <li className="text-gray-900 font-medium">#{kycId?.slice(0, 8)}</li>
              </ol>
            </nav>

            {/* Messages */}
            {successMessage && (
              <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}
            {error && (
              <Alert variant="error" className="mb-6" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* User Info */}
                <div className="flex items-center gap-5">
                  {kyc.user_avatar || kyc.user_profile_picture_url || kyc.display_picture ? (
                    <img
                      src={kyc.user_avatar || kyc.user_profile_picture_url || kyc.display_picture}
                      alt={kyc.user_full_name}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-50"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {kyc.user_full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{kyc.user_full_name}</h1>
                    <p className="text-gray-500">{kyc.user_email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {/* Role Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        isMentor
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isMentor ? (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Eagle (Mentor)
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Eaglet (Mentee)
                          </>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                      {kyc.user_is_email_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          {Icons.verified}
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8">
                  <StatItem label="Submitted" value={formatDate(kyc.submitted_at)} />
                  <StatItem
                    label="Days Pending"
                    value={kyc.days_pending ?? '-'}
                    highlight={kyc.days_pending >= 5 ? 'red' : kyc.days_pending >= 3 ? 'amber' : null}
                  />
                  <StatItem label="Completion" value={`${kyc.completion_percentage || 0}%`} highlight="green" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex border-b border-gray-100">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'text-emerald-600 bg-emerald-50/50 border-b-2 border-emerald-500'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span className={activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}>
                          {tab.icon}
                        </span>
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {/* ==================== MENTOR TABS ==================== */}
                    {isMentor && (
                      <>
                        {/* Personal Tab (Mentor) */}
                        {activeTab === 'personal' && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <InfoField label="Full Name" value={kyc.user_full_name} />
                              <InfoField label="Email" value={kyc.user_email} verified={kyc.user_is_email_verified} />
                              <InfoField label="Phone" value={kyc.user_phone_number || kyc.phone_number || 'Not provided'} />
                              <InfoField label="Location" value={kyc.location || 'Not specified'} />
                              <InfoField label="Account Created" value={formatDate(kyc.user_created_at)} />
                              <InfoField label="National ID" value={kyc.national_id_number || 'Not provided'} />
                              <InfoField label="Marital Status" value={kyc.marital_status?.replace(/_/g, ' ') || 'Not specified'} />
                              <InfoField label="Employment Status" value={kyc.employment_status?.replace(/_/g, ' ') || 'Not specified'} />
                            </div>
                          </div>
                        )}

                        {/* Ministry Tab (Mentor) */}
                        {activeTab === 'ministry' && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <InfoField label="Church Name" value={kyc.church_name} />
                              <InfoField label="Role in Church" value={kyc.church_role} />
                              <InfoField label="Years of Service" value={kyc.years_of_service ?? '-'} />
                            </div>
                            {kyc.spiritual_testimony && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Spiritual Testimony</label>
                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                                  <p className="text-gray-700 leading-relaxed italic">"{sanitizeToText(kyc.spiritual_testimony)}"</p>
                                </div>
                              </div>
                            )}
                            {kyc.recommendation_letter && (
                              <DocumentLink
                                href={kyc.recommendation_letter}
                                label="View Recommendation Letter"
                                onClick={() => setDocumentViewer({
                                  isOpen: true,
                                  url: kyc.recommendation_letter,
                                  title: 'Recommendation Letter'
                                })}
                              />
                            )}
                          </div>
                        )}

                        {/* Experience Tab (Mentor) */}
                        {activeTab === 'experience' && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <InfoField label="Area of Expertise" value={kyc.area_of_expertise?.replace(/_/g, ' ') || '-'} />
                              <InfoField label="Current Occupation" value={kyc.current_occupation} />
                            </div>
                            {kyc.profile_description && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Profile Description</label>
                                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                                  <p className="text-gray-700 leading-relaxed">{sanitizeToText(kyc.profile_description)}</p>
                                </div>
                              </div>
                            )}
                            {kyc.linkedin_url && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">LinkedIn Profile</label>
                                <a
                                  href={kyc.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  {Icons.link}
                                  <span className="hover:underline">{kyc.linkedin_url}</span>
                                </a>
                              </div>
                            )}
                            {kyc.cv_url && (
                              <DocumentLink
                                href={kyc.cv_url}
                                label="View CV"
                                onClick={() => setDocumentViewer({
                                  isOpen: true,
                                  url: kyc.cv_url,
                                  title: 'Curriculum Vitae'
                                })}
                              />
                            )}
                            {(kyc.mentorship_types?.length > 0 || kyc.mentorship_interests?.length > 0) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-3">Mentorship Types Offered</label>
                                <div className="flex flex-wrap gap-2">
                                  {(kyc.mentorship_types || kyc.mentorship_interests || []).map((type, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium capitalize"
                                    >
                                      {type.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Consent Tab (Mentor) */}
                        {activeTab === 'consent' && (
                          <div className="space-y-5 animate-fadeIn">
                            <ConsentItem label="Background Check Consent" checked={kyc.background_check_consent} />
                            <ConsentItem label="Code of Conduct Agreement" checked={kyc.code_of_conduct_agreed} />
                            <ConsentItem label="Statement of Faith Agreement" checked={kyc.statement_of_faith_agreed} />

                            {kyc.digital_signature && (
                              <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="block text-sm font-medium text-gray-500 mb-2">Digital Signature</label>
                                <p className="text-xl font-serif italic text-gray-700">{kyc.digital_signature}</p>
                                <p className="text-sm text-gray-400 mt-2">Signed on {formatDate(kyc.consent_date)}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* ==================== MENTEE TABS ==================== */}
                    {isMentee && (
                      <>
                        {/* Personal Tab (Mentee) */}
                        {activeTab === 'personal' && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <InfoField label="Full Name" value={kyc.user_full_name} />
                              <InfoField label="Email" value={kyc.user_email} verified={kyc.user_is_email_verified} />
                              <InfoField label="Phone" value={kyc.phone_number || kyc.user_phone_number || 'Not provided'} />
                              <InfoField label="National ID" value={kyc.national_id_number || 'Not provided'} />
                              <InfoField label="Marital Status" value={kyc.marital_status?.replace(/_/g, ' ') || 'Not specified'} />
                              <InfoField label="Country" value={kyc.country || 'Not specified'} />
                              <InfoField label="City" value={kyc.city || 'Not specified'} />
                              <InfoField label="Location Details" value={kyc.location || 'Not specified'} />
                              <InfoField label="Account Created" value={formatDate(kyc.user_created_at)} />
                            </div>
                          </div>
                        )}

                        {/* Professional Tab (Mentee) */}
                        {activeTab === 'professional' && (
                          <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <InfoField label="Employment Status" value={kyc.employment_status?.replace(/_/g, ' ') || 'Not specified'} />
                            </div>
                            {kyc.linkedin_url && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">LinkedIn Profile</label>
                                <a
                                  href={kyc.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  {Icons.link}
                                  <span className="hover:underline">{kyc.linkedin_url}</span>
                                </a>
                              </div>
                            )}
                            {kyc.cv_url && (
                              <DocumentLink
                                href={kyc.cv_url}
                                label="View CV"
                                onClick={() => setDocumentViewer({
                                  isOpen: true,
                                  url: kyc.cv_url,
                                  title: 'Curriculum Vitae'
                                })}
                              />
                            )}
                            {!kyc.cv_url && (
                              <p className="text-gray-400 text-sm italic">No CV uploaded</p>
                            )}
                          </div>
                        )}

                        {/* About Tab (Mentee) */}
                        {activeTab === 'about' && (
                          <div className="space-y-6 animate-fadeIn">
                            {kyc.bio ? (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Personal Bio</label>
                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                                  <p className="text-gray-700 leading-relaxed italic">"{sanitizeToText(kyc.bio)}"</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm italic">No bio provided</p>
                            )}
                          </div>
                        )}

                        {/* Preferences Tab (Mentee) */}
                        {activeTab === 'preferences' && (
                          <div className="space-y-6 animate-fadeIn">
                            {kyc.mentorship_types?.length > 0 ? (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-3">Mentorship Interests</label>
                                <div className="flex flex-wrap gap-2">
                                  {kyc.mentorship_types.map((type, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium capitalize"
                                    >
                                      {type.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm italic">No mentorship interests specified</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Actions */}
                {canTakeAction && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Review Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {isApproving ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          Icons.checkCircle
                        )}
                        {isApproving ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setShowChangesModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all duration-200 shadow-lg shadow-amber-500/20"
                      >
                        {Icons.edit}
                        Request Changes
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-200"
                      >
                        {Icons.cancel}
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Internal Notes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400">{Icons.note}</span>
                    <h3 className="font-semibold text-gray-900">Internal Notes</h3>
                  </div>
                  {kyc.review_notes ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap">
                      {kyc.review_notes}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No notes added yet.</p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400">{Icons.timeline}</span>
                    <h3 className="font-semibold text-gray-900">Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    <TimelineItem
                      icon={Icons.plus}
                      iconBg="bg-blue-50"
                      iconColor="text-blue-500"
                      label="Application Created"
                      date={formatDateTime(kyc.created_at)}
                    />
                    {kyc.submitted_at && (
                      <TimelineItem
                        icon={Icons.send}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-500"
                        label="Submitted for Review"
                        date={formatDateTime(kyc.submitted_at)}
                      />
                    )}
                    {kyc.reviewed_at && (
                      <TimelineItem
                        icon={kyc.status === 'approved' ? Icons.checkCircle : kyc.status === 'rejected' ? Icons.cancel : Icons.edit}
                        iconBg={kyc.status === 'approved' ? 'bg-emerald-50' : kyc.status === 'rejected' ? 'bg-red-50' : 'bg-amber-50'}
                        iconColor={kyc.status === 'approved' ? 'text-emerald-500' : kyc.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}
                        label={`${kyc.status === 'approved' ? 'Approved' : kyc.status === 'rejected' ? 'Rejected' : 'Reviewed'}`}
                        date={formatDateTime(kyc.reviewed_at)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500">{Icons.cancel}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Reject Application</h2>
            <p className="text-gray-500 mt-1 text-sm">This action cannot be undone.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the application is being rejected..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 resize-none transition-all"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes (Optional)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any internal notes..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-100 focus:border-gray-400 resize-none transition-all"
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isRejecting ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </Modal>
      )}

      {/* Document Viewer Modal */}
      {documentViewer.isOpen && (
        <DocumentViewerModal
          url={documentViewer.url}
          title={documentViewer.title}
          onClose={() => setDocumentViewer({ isOpen: false, url: '', title: '' })}
        />
      )}

      {/* Request Changes Modal */}
      {showChangesModal && (
        <Modal onClose={() => setShowChangesModal(false)}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-500">{Icons.edit}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Request Changes</h2>
            <p className="text-gray-500 mt-1 text-sm">The applicant will be notified.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Changes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Describe what changes are needed..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-100 focus:border-amber-400 resize-none transition-all"
              rows={5}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowChangesModal(false)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={isRequestingChanges || !reviewNotes.trim()}
              className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isRequestingChanges ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Sub-components
const StatItem = ({ label, value, highlight }) => {
  const colorMap = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    green: 'text-emerald-600',
  };

  return (
    <div className="text-right">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`font-semibold ${highlight ? colorMap[highlight] : 'text-gray-900'}`}>{value}</p>
    </div>
  );
};

const InfoField = ({ label, value, verified }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <p className="text-gray-900">{value || '-'}</p>
      {verified && <span className="text-emerald-500">{Icons.verified}</span>}
    </div>
  </div>
);

const ConsentItem = ({ label, checked }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      checked ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
    }`}>
      {checked ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
    <span className={checked ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
  </div>
);

const DocumentLink = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors group cursor-pointer"
  >
    <span className="text-gray-400 group-hover:text-emerald-500 transition-colors">{Icons.document}</span>
    <span className="font-medium">{label}</span>
    <span className="text-gray-300 group-hover:text-emerald-500 transition-colors">{Icons.externalLink}</span>
  </button>
);

const TimelineItem = ({ icon, iconBg, iconColor, label, date }) => (
  <div className="flex items-start gap-3">
    <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <span className={iconColor}>{icon}</span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-400">{date}</p>
    </div>
  </div>
);

const DocumentViewerModal = ({ url, title, onClose }) => {
  // Construct full URL if it's a relative path
  const getFullUrl = (fileUrl) => {
    if (!fileUrl) return '';
    // If it's already a full URL, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Otherwise, prepend the backend URL
    return `${BACKEND_URL}${fileUrl}`;
  };

  const fullUrl = getFullUrl(url);
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-emerald-500">{Icons.document}</span>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {Icons.externalLink}
              <span>Open in New Tab</span>
            </a>
            <a
              href={fullUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {Icons.x}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)] bg-gray-100">
          {isImage ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <img
                src={fullUrl}
                alt={title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-gray-500 p-8">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Unable to load image</p>
                <p className="text-sm mt-1">Try downloading the file instead</p>
              </div>
            </div>
          ) : isPdf ? (
            <div className="min-h-[500px]">
              <iframe
                src={fullUrl}
                title={title}
                className="w-full h-[70vh] rounded-lg border border-gray-200 bg-white"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-medium mb-2">Document Preview</p>
              <p className="text-sm text-gray-400 mb-6">This file type cannot be previewed directly</p>
              <a
                href={fullUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {Icons.x}
      </button>
      {children}
    </div>
  </div>
);

export default AdminKYCDetailPage;
