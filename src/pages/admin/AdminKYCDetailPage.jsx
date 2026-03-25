import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { adminService } from '../../modules/auth/services/auth-service';
import { sanitizeToText, stripCloudinarySignature } from '../../shared/utils/sanitize';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = API_BASE_URL.replace('/api/v1', '');


// ─── Status Helpers ──────────────────────────────────────────────────────────
const STATUS_MAP = {
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', icon: 'edit_note' },
  submitted: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'send' },
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'hourglass_top' },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'check_circle' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', icon: 'cancel' },
  requires_changes: { label: 'Changes Required', bg: 'bg-orange-50', text: 'text-orange-700', icon: 'edit' },
};

const USER_STATUS_MAP = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'verified' },
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'hourglass_top' },
  suspended: { label: 'Suspended', bg: 'bg-red-50', text: 'text-red-700', icon: 'block' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100', text: 'text-slate-600', icon: 'person_off' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const daysBetween = (d) => d ? Math.max(0, Math.floor((Date.now() - new Date(d)) / 86400000)) : 0;

// ─── Sub-components ──────────────────────────────────────────────────────────

const Badge = ({ config }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.text}`}>
    <span className="material-symbols-outlined text-sm">{config.icon}</span>
    {config.label}
  </span>
);

const InfoField = ({ label, value, isLink, isDocument, onDocClick }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
    {isLink && value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate">
        {value}
        <span className="material-symbols-outlined text-sm">open_in_new</span>
      </a>
    ) : isDocument && value ? (
      <button onClick={onDocClick} className="text-sm font-medium text-primary hover:underline flex items-center gap-1 text-left">
        <span className="material-symbols-outlined text-sm">description</span>
        View Document
      </button>
    ) : (
      <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-300 italic">Not specified</span>}</p>
    )}
  </div>
);

const StatBadge = ({ icon, label, value, color = 'text-slate-500' }) => (
  <div className="flex flex-col items-center text-center">
    <span className={`material-symbols-outlined text-lg ${color} mb-0.5`}>{icon}</span>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <p className="text-sm font-bold text-slate-900">{value}</p>
  </div>
);

const MentorshipChip = ({ type }) => {
  const labels = {
    career_growth: 'Career Growth', leadership: 'Leadership', entrepreneurship: 'Entrepreneurship',
    technology: 'Technology', personal_development: 'Personal Dev', spirituality: 'Spirituality',
  };
  return (
    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
      {labels[type] || type}
    </span>
  );
};

// ─── Modal Component ─────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600">{icon}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Document Viewer ─────────────────────────────────────────────────────────
// Note: PDFs from the backend cannot be embedded in an iframe due to the server's
// X-Frame-Options: SAMEORIGIN header. We open them in a new tab instead.
const DocumentViewer = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;
  const rawUrl = url?.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  const fullUrl = stripCloudinarySignature(rawUrl);
  // Detect by extension OR Cloudinary URL patterns
  const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(url || '') || url?.includes('image/upload') || url?.includes('profile_pictures') || url?.includes('content_images');
  const isPdf = /\.pdf/i.test(url || '') || url?.includes('/cvs/') || url?.includes('/documents/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <div className="flex items-center gap-2">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-primary"
              title="Open in new tab">
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-slate-400">close</span>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-auto max-h-[70vh] flex items-center justify-center bg-slate-50">
          {isImage ? (
            <img
              src={fullUrl}
              alt={title}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : isPdf ? (
            // PDFs cannot be iframed due to X-Frame-Options: SAMEORIGIN on the backend.
            // Direct the admin to open in a new tab for proper viewing.
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-red-400">picture_as_pdf</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
              <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto">
                PDF documents must be opened in a new tab for security reasons.
              </p>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Open PDF
              </a>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">description</span>
              <p className="text-slate-500 mb-4">Preview not available for this file type.</p>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">download</span> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AdminKYCDetailPage = () => {
  const { kycId } = useParams();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'mentor';

  // ─── State ───────────────────────────────────────────────────────────────
  const [kyc, setKyc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const [activeTab, setActiveTab] = useState('personal');
  const [documentViewer, setDocumentViewer] = useState({ isOpen: false, url: '', title: '' });

  const isMentor = roleParam === 'mentor' || roleParam === 'eagle';

  // ─── Data Fetching ───────────────────────────────────────────────────────
  const fetchKYC = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await adminService.getKYCDetail(kycId, roleParam);
      if (response.success) setKyc(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [kycId, roleParam]);

  useEffect(() => { fetchKYC(); }, [fetchKYC]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setIsApproving(true);
    setError('');
    try {
      const response = await adminService.approveKYC(kycId, roleParam, { review_notes: reviewNotes });
      if (response.success) {
        setSuccessMessage('Application approved successfully!');
        await fetchKYC();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) { setError(err.message || 'Failed to approve'); }
    finally { setIsApproving(false); }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { setError('Please provide a rejection reason'); return; }
    setIsRejecting(true);
    setError('');
    try {
      const response = await adminService.rejectKYC(kycId, roleParam, { rejection_reason: rejectionReason, review_notes: reviewNotes });
      if (response.success) {
        setSuccessMessage('Application rejected. Applicant notified.');
        setShowRejectModal(false);
        await fetchKYC();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) { setError(err.message || 'Failed to reject'); }
    finally { setIsRejecting(false); }
  };

  const handleRequestChanges = async () => {
    if (!reviewNotes.trim()) { setError('Please provide details about required changes'); return; }
    setIsRequestingChanges(true);
    setError('');
    try {
      const response = await adminService.requestKYCChanges(kycId, roleParam, { review_notes: reviewNotes });
      if (response.success) {
        setSuccessMessage('Changes requested. Applicant notified.');
        setShowChangesModal(false);
        await fetchKYC();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) { setError(err.message || 'Failed to request changes'); }
    finally { setIsRequestingChanges(false); }
  };

  const handleSuspend = async () => {
    if (!suspensionReason.trim() || suspensionReason.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters)');
      return;
    }
    setIsSuspending(true);
    setError('');
    try {
      const userId = kyc.user_id || kyc.user?.id;
      const response = await adminService.suspendUser(userId, suspensionReason);
      if (response.success) {
        setSuccessMessage('User has been suspended.');
        setShowSuspendModal(false);
        setSuspensionReason('');
        await fetchKYC();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) { setError(err.message || 'Failed to suspend user'); }
    finally { setIsSuspending(false); }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    setError('');
    try {
      const userId = kyc.user_id || kyc.user?.id;
      const response = await adminService.reactivateUser(userId);
      if (response.success) {
        setSuccessMessage('User has been reactivated.');
        await fetchKYC();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) { setError(err.message || 'Failed to reactivate user'); }
    finally { setIsReactivating(false); }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardLayout variant="admin">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-5 bg-slate-200 rounded w-56" />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-slate-200 rounded w-48" />
                <div className="h-4 bg-slate-200 rounded w-64" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-8 border border-slate-200/50 h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!kyc) {
    return (
      <DashboardLayout variant="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg text-center max-w-md border border-slate-200/50">
            <span className="material-symbols-outlined text-6xl text-red-300 mb-4">error_outline</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Not Found</h2>
            <p className="text-slate-500 mb-8">The requested KYC application could not be found.</p>
            <Link to="/admin/kyc"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Applications
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Computed ─────────────────────────────────────────────────────────────
  const canTakeAction = kyc.status === 'submitted' || kyc.status === 'under_review';
  const isApproved = kyc.status === 'approved';
  const userStatus = kyc.user_status || (isApproved ? 'active' : 'pending');
  const isSuspended = userStatus === 'suspended';
  const statusConfig = STATUS_MAP[kyc.status] || STATUS_MAP.draft;
  const userStatusConfig = USER_STATUS_MAP[userStatus] || USER_STATUS_MAP.pending;
  const pendingDays = daysBetween(kyc.submitted_at);
  const completionPct = kyc.completion_percentage ?? 100;

  const avatarUrl = kyc.display_picture_url || kyc.display_picture || kyc.user_profile_picture_url || kyc.user_avatar || kyc.avatar;
  const fullAvatarUrl = avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND_URL}${avatarUrl}`) : null;
  const fullName = kyc.full_name || kyc.user_full_name || `${kyc.first_name || ''} ${kyc.last_name || ''}`.trim() || 'Unknown';
  const email = kyc.email || kyc.user_email || '';

  const tabs = [
    { id: 'personal', label: 'Personal', icon: 'person' },
    { id: 'professional', label: 'Professional', icon: 'work' },
    { id: 'about', label: 'About', icon: 'edit_note' },
    { id: 'preferences', label: 'Preferences', icon: 'favorite' },
  ];

  // ─── Tab Content Renderers ───────────────────────────────────────────────
  const renderPersonalTab = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
      <InfoField label="Full Name" value={fullName} />
      <InfoField label="Email" value={email} />
      <InfoField label="Phone" value={kyc.user_phone_number || kyc.phone_number} />
      <InfoField label="National ID" value={kyc.national_id_number} />
      <InfoField label="Marital Status" value={kyc.marital_status?.replace('_', ' ')} />
      {isMentor ? (
        <InfoField label="Location" value={kyc.location} />
      ) : (
        <>
          <InfoField label="Country" value={kyc.country} />
          <InfoField label="City" value={kyc.city} />
          <InfoField label="Location Details" value={kyc.location} />
        </>
      )}
      <InfoField label="Employment Status" value={kyc.employment_status?.replace('_', ' ')} />
      <InfoField label="Account Created" value={formatDate(kyc.user_created_at || kyc.created_at)} />
    </div>
  );

  const renderProfessionalTab = () => {
    const cvUrl = kyc.cv_url || kyc.cv;
    const cvFullUrl = cvUrl ? (cvUrl.startsWith('http') ? cvUrl : `${BACKEND_URL}${cvUrl}`) : null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <InfoField label="Employment Status" value={kyc.employment_status?.replace('_', ' ')} />
        <InfoField label="LinkedIn" value={kyc.linkedin_url} isLink />
        <div className="sm:col-span-2">
          <InfoField label="CV / Resume" value={cvFullUrl} isDocument
            onDocClick={() => setDocumentViewer({ isOpen: true, url: cvFullUrl, title: 'Curriculum Vitae' })} />
        </div>
      </div>
    );
  };

  const renderAboutTab = () => (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {isMentor ? 'Profile Description' : 'Personal Bio'}
        </span>
        <div className="mt-2 p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[120px]">
          {sanitizeToText(kyc.profile_description || kyc.bio) || <span className="text-slate-300 italic">No information provided</span>}
        </div>
      </div>
      {(kyc.display_picture_url || kyc.display_picture) && (
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Display Picture</span>
          <button onClick={() => setDocumentViewer({ isOpen: true, url: kyc.display_picture_url || kyc.display_picture, title: 'Display Picture' })}
            className="mt-2 block">
            <img
              src={(() => { const url = kyc.display_picture_url || kyc.display_picture; return url?.startsWith('http') ? url : `${BACKEND_URL}${url}`; })()}
              alt="Display"
              className="w-32 h-32 object-cover rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-32 h-32 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-300"><span class="material-symbols-outlined text-3xl">broken_image</span><span class="text-xs mt-1">Not available</span></div>';
              }}
            />
          </button>
        </div>
      )}
    </div>
  );

  const renderPreferencesTab = () => {
    const types = kyc.mentorship_types || kyc.mentorship_interests || [];
    return (
      <div className="space-y-5">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {isMentor ? 'Mentorship Types Offered' : 'Mentorship Interests'}
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {types.length > 0 ? types.map((t, idx) => <MentorshipChip key={`${t}-${idx}`} type={t} />) : (
              <span className="text-sm text-slate-300 italic">None specified</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalTab();
      case 'professional': return renderProfessionalTab();
      case 'about': return renderAboutTab();
      case 'preferences': return renderPreferencesTab();
      default: return renderPersonalTab();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout variant="admin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors">Admin</Link>
          <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
          <Link to="/admin/kyc" className="text-slate-400 hover:text-primary transition-colors">KYC Reviews</Link>
          <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
          <span className="text-slate-900 font-medium">#{kycId?.slice(0, 8)}</span>
        </nav>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        {successMessage && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {successMessage}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
            <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}

        {/* ── Profile Header Card ─────────────────────────────────────────── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          {/* Suspended banner */}
          {isSuspended && (
            <div className="flex items-center gap-3 px-6 py-3 bg-red-500 text-white text-sm font-medium">
              <span className="material-symbols-outlined text-lg">gpp_bad</span>
              This user is currently suspended
              {kyc.suspension_reason && <span className="opacity-80">— {kyc.suspension_reason}</span>}
            </div>
          )}

          <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {fullAvatarUrl ? (
                <img src={fullAvatarUrl} alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setDocumentViewer({ isOpen: true, url: avatarUrl, title: 'Profile Picture' })}
                  onError={(e) => {
                    // Image failed (404 from ephemeral disk) — show initials fallback
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ display: fullAvatarUrl ? 'none' : 'flex' }}
              >
                {fullName.charAt(0)}
              </div>
              {isSuspended && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <span className="material-symbols-outlined text-white text-xs">block</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{fullName}</h1>
              <p className="text-slate-500 text-sm mb-3">{email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${isMentor ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                  <span className="material-symbols-outlined text-sm">{isMentor ? 'school' : 'person'}</span>
                  {isMentor ? 'Eagle (Mentor)' : 'Eaglet (Mentee)'}
                </span>
                <Badge config={statusConfig} />
                {isApproved && <Badge config={userStatusConfig} />}
                {kyc.is_email_verified !== false && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-600">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 bg-slate-50/80 rounded-xl px-6 py-4 border border-slate-100">
              <StatBadge icon="calendar_today" label="Submitted" value={formatDate(kyc.submitted_at)} />
              <div className="w-px h-10 bg-slate-200" />
              <StatBadge icon="schedule" label="Days Pending"
                value={pendingDays}
                color={pendingDays > 7 ? 'text-red-500' : pendingDays > 3 ? 'text-amber-500' : 'text-slate-500'} />
              <div className="w-px h-10 bg-slate-200" />
              <StatBadge icon="donut_large" label="Completion"
                value={`${completionPct}%`}
                color={completionPct === 100 ? 'text-emerald-500' : 'text-amber-500'} />
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Tabbed Profile Data ─────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
              {/* Tab Bar */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab.id
                      ? 'border-primary text-primary bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50'
                      }`}>
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">{renderTabContent()}</div>
            </div>

            {/* ── Review Notes (if any) ─────────────────────────────────── */}
            {kyc.review_notes && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-slate-400">sticky_note_2</span>
                  <h3 className="text-base font-bold text-slate-900">Internal Notes</h3>
                </div>
                <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">{kyc.review_notes}</div>
              </div>
            )}

            {/* ── Rejection Reason (if rejected) ───────────────────────── */}
            {kyc.rejection_reason && (
              <div className="bg-red-50/60 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-red-400">warning</span>
                  <h3 className="text-base font-bold text-red-800">Rejection Reason</h3>
                </div>
                <div className="text-sm text-red-700 whitespace-pre-wrap">{kyc.rejection_reason}</div>
              </div>
            )}
          </div>

          {/* ── Right Column: Actions & Timeline ─────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* ── Review Actions ────────────────────────────────────────── */}
            {canTakeAction && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4">Review Actions</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={handleApprove} disabled={isApproving}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-lg">{isApproving ? 'hourglass_top' : 'check_circle'}</span>
                    {isApproving ? 'Approving…' : 'Approve'}
                  </button>

                  <button onClick={() => setShowChangesModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Request Changes
                  </button>

                  <button onClick={() => setShowRejectModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all">
                    <span className="material-symbols-outlined text-lg">cancel</span>
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* ── User Management (post-approval) ──────────────────────── */}
            {isApproved && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-900 mb-1">User Management</h3>
                <p className="text-xs text-slate-400 mb-4">Manage this user&apos;s platform access</p>

                {!isSuspended ? (
                  <button onClick={() => setShowSuspendModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30">
                    <span className="material-symbols-outlined text-lg">block</span>
                    Suspend User
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-xl text-xs text-red-700">
                      <div className="font-bold mb-1">Suspended</div>
                      {kyc.suspension_reason && <p className="opacity-80">{kyc.suspension_reason}</p>}
                      {kyc.suspended_at && <p className="opacity-60 mt-1">Since {formatDate(kyc.suspended_at)}</p>}
                    </div>
                    <button onClick={handleReactivate} disabled={isReactivating}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50">
                      <span className="material-symbols-outlined text-lg">{isReactivating ? 'hourglass_top' : 'lock_open'}</span>
                      {isReactivating ? 'Reactivating…' : 'Reactivate User'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Timeline ──────────────────────────────────────────────── */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-slate-400 text-lg">timeline</span>
                <h3 className="text-base font-bold text-slate-900">Timeline</h3>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-200">
                {/* Created */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full bg-slate-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Application Created</p>
                  <p className="text-xs text-slate-400">{formatDateTime(kyc.created_at)}</p>
                </div>

                {/* Submitted */}
                {kyc.submitted_at && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Submitted for Review</p>
                    <p className="text-xs text-slate-400">{formatDateTime(kyc.submitted_at)}</p>
                  </div>
                )}

                {/* Reviewed */}
                {kyc.reviewed_at && (
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ${kyc.status === 'approved' ? 'bg-emerald-100' : kyc.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${kyc.status === 'approved' ? 'bg-emerald-500' : kyc.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {kyc.status === 'approved' ? 'Approved' : kyc.status === 'rejected' ? 'Rejected' : 'Review Updated'}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(kyc.reviewed_at)}</p>
                    {kyc.reviewed_by && <p className="text-xs text-slate-400">by {kyc.reviewed_by}</p>}
                  </div>
                )}

                {/* Suspended */}
                {kyc.suspended_at && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full bg-red-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <p className="text-sm font-medium text-red-700">User Suspended</p>
                    <p className="text-xs text-slate-400">{formatDateTime(kyc.suspended_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══════════════════════════════════════════════════════════ */}

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Application" icon="cancel">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rejection Reason *</label>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none transition-all"
              rows={4} placeholder="Explain why this application is being rejected…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Notes (optional)</label>
            <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-300 resize-none transition-all"
              rows={2} placeholder="Notes for admin reference…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowRejectModal(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleReject} disabled={isRejecting}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
              {isRejecting ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Changes Modal */}
      <Modal isOpen={showChangesModal} onClose={() => setShowChangesModal(false)} title="Request Changes" icon="edit">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">What needs to change? *</label>
            <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none transition-all"
              rows={4} placeholder="Describe the changes the applicant needs to make…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowChangesModal(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleRequestChanges} disabled={isRequestingChanges}
              className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
              {isRequestingChanges ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Suspend User Modal */}
      <Modal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} title="Suspend User" icon="gpp_bad">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-lg mt-0.5">warning</span>
            <div>
              <p className="font-semibold">This will immediately revoke the user&apos;s access.</p>
              <p className="text-xs opacity-80 mt-1">They will be unable to log in or use any platform features until reactivated.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Suspension *</label>
            <textarea value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none transition-all"
              rows={4} placeholder="Describe why this user is being suspended (e.g. violation of rules, misconduct)…" />
            <p className="text-xs text-slate-400 mt-1">{suspensionReason.length}/1000 characters (min 10)</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowSuspendModal(false); setSuspensionReason(''); }}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSuspend} disabled={isSuspending || suspensionReason.trim().length < 10}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSuspending ? 'Suspending…' : 'Confirm Suspension'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={documentViewer.isOpen}
        onClose={() => setDocumentViewer({ isOpen: false, url: '', title: '' })}
        url={documentViewer.url}
        title={documentViewer.title}
      />
    </DashboardLayout>
  );
};

export default AdminKYCDetailPage;
