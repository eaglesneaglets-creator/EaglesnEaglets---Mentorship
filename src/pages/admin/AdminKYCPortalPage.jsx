import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@components/ui';
import { adminService } from '../../modules/auth/services/auth-service';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';

/**
 * Stat Card Component
 */
const StatCard = ({ icon, iconBg, gradient, label, value, change, pulse, delay = 0 }) => (
  <div
    className={`group relative rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${gradient || 'bg-white/80 backdrop-blur-sm border border-slate-200/50'}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Decorative Wave */}
    {gradient && (
      <div className="absolute bottom-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="80" cy="80" r="60" fill="currentColor" className="text-white" />
        </svg>
      </div>
    )}

    <div className="relative flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <div className={`p-2 md:p-2.5 rounded-xl w-fit mb-1 md:mb-2 ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <span className="material-symbols-outlined text-lg md:text-xl">{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl md:text-3xl font-bold ${gradient ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {change !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
              gradient ? 'bg-white/20 text-white' : change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              <span className="material-symbols-outlined text-xs">
                {change > 0 ? 'trending_up' : 'trending_down'}
              </span>
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className={`text-xs md:text-sm font-medium ${gradient ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      </div>
      {pulse && value > 0 && (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      )}
    </div>
  </div>
);

/**
 * KYC Mobile Card — shown on small screens instead of table row
 */
const KYCApplicationCard = ({ app, onReview, formatDate, formatTimeAgo, getStatusConfig }) => {
  const statusConfig = getStatusConfig(app.status);
  const appRole = app.role || (app.kyc_type === 'mentee' ? 'mentee' : 'mentor');
  const isEagle = appRole === 'mentor' || appRole === 'eagle';

  return (
    <div className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {app.user_avatar || app.user_profile_picture_url ? (
          <img
            src={app.user_avatar || app.user_profile_picture_url}
            alt={app.user_full_name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0"
          />
        ) : (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 ${
            isEagle ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-green-600'
          }`}>
            {app.user_full_name?.charAt(0) || 'U'}
          </div>
        )}

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{app.user_full_name}</p>
              <p className="text-xs text-slate-500 truncate">{app.user_email}</p>
            </div>
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold capitalize border flex-shrink-0 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {app.status?.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
              isEagle
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <span className="material-symbols-outlined text-xs">{isEagle ? 'verified_user' : 'person'}</span>
              {isEagle ? 'Eagle' : 'Eaglet'}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs capitalize">
              {app.area_of_expertise?.replace(/_/g, ' ') || 'Not specified'}
            </span>
            <span className="text-xs text-slate-400">{formatDate(app.submitted_at)}</span>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onReview(app.id, appRole)}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/25"
        >
          Review Application
        </button>
      </div>
    </div>
  );
};

/**
 * KYC Application Row — desktop table row
 */
const KYCApplicationRow = ({ app, onReview, formatDate, formatTimeAgo, getStatusConfig }) => {
  const statusConfig = getStatusConfig(app.status);
  const appRole = app.role || (app.kyc_type === 'mentee' ? 'mentee' : 'mentor');
  const isEagle = appRole === 'mentor' || appRole === 'eagle';

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors duration-300">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {app.user_avatar || app.user_profile_picture_url ? (
            <img
              src={app.user_avatar || app.user_profile_picture_url}
              alt={app.user_full_name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0"
            />
          ) : (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0 ${
              isEagle ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-green-600'
            }`}>
              {app.user_full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">{app.user_full_name}</p>
            <p className="text-xs text-slate-500 truncate">{app.user_email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
          isEagle ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <span className="material-symbols-outlined text-sm">{isEagle ? 'verified_user' : 'person'}</span>
          {isEagle ? 'Eagle' : 'Eaglet'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium capitalize">
          {app.area_of_expertise?.replace(/_/g, ' ') || 'Not specified'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold capitalize border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
          {app.status?.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <p className="text-xs font-medium text-slate-700">{formatDate(app.submitted_at)}</p>
          {app.days_pending !== null && app.days_pending >= 0 && (
            <p className={`text-xs mt-0.5 ${
              app.days_pending >= 5 ? 'text-rose-500 font-medium' :
              app.days_pending >= 3 ? 'text-amber-500' : 'text-slate-400'
            }`}>
              {formatTimeAgo(app.days_pending)}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onReview(app.id, appRole)}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg hover:shadow-primary/25"
        >
          Review
        </button>
      </td>
    </tr>
  );
};

/**
 * AdminKYCPortalPage Component
 * Uses shared DashboardLayout for consistent navigation
 */
const AdminKYCPortalPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    requires_changes: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {
          page: pagination.page,
          per_page: pagination.per_page,
        };
        if (statusFilter) params.status = statusFilter;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const response = await adminService.getKYCList(params);
        if (response.success) {
          const apps = response.data?.applications || response.data?.results || response.data || [];
          setApplications(Array.isArray(apps) ? apps : []);
          setSummary(prev => response.data?.summary || prev);
          if (response.data?.pagination) {
            setPagination(response.data.pagination);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load applications');
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [statusFilter, roleFilter, debouncedSearch, pagination.page, pagination.per_page]);

  const handleReview = useCallback((kycId, role = 'mentor') => {
    navigate(`/admin/kyc/${kycId}?role=${role}`);
  }, [navigate]);

  const getStatusConfig = (status) => {
    const configs = {
      approved: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      rejected: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
      requires_changes: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
      pending: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
      submitted: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
      under_review: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (days) => {
    if (days === null || days === undefined) return null;
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const summaryCards = [
    { label: 'Total Applications', value: summary.total, gradient: 'bg-gradient-to-br from-slate-600 to-slate-800', icon: 'description', iconBg: 'bg-white/20 text-white' },
    { label: 'Pending Review', value: summary.pending, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: 'pending', iconBg: 'bg-white/20 text-white', pulse: true },
    { label: 'Approved', value: summary.approved, gradient: 'bg-gradient-to-br from-emerald-500 to-green-600', icon: 'check_circle', iconBg: 'bg-white/20 text-white', change: 12 },
    { label: 'Rejected', value: summary.rejected, gradient: 'bg-gradient-to-br from-rose-500 to-red-600', icon: 'cancel', iconBg: 'bg-white/20 text-white' },
  ];

  return (
    <DashboardLayout variant="admin">
      <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-base">verified_user</span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                KYC Management
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Review Portal</h1>
            <p className="text-slate-500 mt-1 text-sm">Review and manage mentor & mentee verification applications</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStatusFilter('pending');
                setRoleFilter('all');
                setSearchQuery('');
              }}
              className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group"
            >
              <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">refresh</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {summaryCards.map((card, index) => (
            <StatCard key={card.label} {...card} delay={index * 100} />
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-6 border border-slate-200/50 shadow-sm">
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-200/50">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role:</span>
            {[
              { value: 'all', label: 'All', labelFull: 'All Applications', icon: 'apps' },
              { value: 'mentor', label: 'Eagles', labelFull: 'Eagles (Mentors)', icon: 'verified_user' },
              { value: 'mentee', label: 'Eaglets', labelFull: 'Eaglets (Mentees)', icon: 'person' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setRoleFilter(tab.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  roleFilter === tab.value
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.labelFull}</span>
                <span className="sm:hidden">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: 'pending', label: 'Pending', count: summary.pending },
                { value: 'submitted', label: 'Submitted', count: summary.submitted || 0 },
                { value: 'approved', label: 'Approved', count: summary.approved },
                { value: 'rejected', label: 'Rejected', count: summary.rejected },
                { value: 'requires_changes', label: 'Changes', count: summary.requires_changes },
                { value: '', label: 'All', count: summary.total },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                    statusFilter === tab.value
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 ${statusFilter === tab.value ? 'opacity-90' : 'opacity-50'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="animate-shake" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Applications Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading applications...</p>
            </div>
          ) : !Array.isArray(applications) || applications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-400">folder_open</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Applications Found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? 'No matches found. Try adjusting your search terms.'
                  : 'There are no applications matching this filter at the moment.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile card list — no horizontal scroll */}
              <div className="md:hidden divide-y divide-slate-100">
                {applications.map((app) => (
                  <KYCApplicationCard
                    key={app.id}
                    app={app}
                    onReview={handleReview}
                    formatDate={formatDate}
                    formatTimeAgo={formatTimeAgo}
                    getStatusConfig={getStatusConfig}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      <th className="px-6 py-4">Applicant</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Expertise</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <KYCApplicationRow
                        key={app.id}
                        app={app}
                        onReview={handleReview}
                        formatDate={formatDate}
                        formatTimeAgo={formatTimeAgo}
                        getStatusConfig={getStatusConfig}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{(pagination.page - 1) * pagination.per_page + 1}</span> to{' '}
                    <span className="font-semibold text-slate-700">{Math.min(pagination.page * pagination.per_page, pagination.total)}</span> of{' '}
                    <span className="font-semibold text-slate-700">{pagination.total}</span> applications
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.total_pages}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                    >
                      Next
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminKYCPortalPage;
