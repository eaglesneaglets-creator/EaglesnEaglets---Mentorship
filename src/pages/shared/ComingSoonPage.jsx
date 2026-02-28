import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@components/layout';
import { useAuthStore } from '@store';

/**
 * ComingSoonPage Component
 * A beautifully designed placeholder page for features under development
 */
const ComingSoonPage = ({ title, description, icon = 'rocket_launch' }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Determine variant based on user role
  const getVariant = () => {
    if (user?.role === 'admin') return 'admin';
    if (user?.role === 'eagle') return 'eagle';
    return 'eaglet';
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'eagle') return '/eagle/dashboard';
    return '/eaglet/dashboard';
  };

  return (
    <DashboardLayout variant={getVariant()}>
      <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center">
        {/* Main Card */}
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Background Decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Card Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-12 text-center">
            {/* Icon Container */}
            <div className="relative inline-flex mb-8">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              </div>

              {/* Icon Circle */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-white text-4xl">
                  {icon}
                </span>
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-sm font-semibold text-amber-700">Coming Soon</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {title}
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
              {description || "We're working hard to bring you this feature. Stay tuned for updates!"}
            </p>

            {/* Progress Indicator */}
            <div className="max-w-xs mx-auto mb-8">
              <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                <span>Development Progress</span>
                <span className="font-medium text-primary">In Progress</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full animate-pulse"
                  style={{ width: '45%' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(getDashboardPath())}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-xl">
                  arrow_back
                </span>
                Back to Dashboard
              </button>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-xl">
                  refresh
                </span>
                Refresh Page
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Have suggestions? We&apos;d love to hear from you!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

ComingSoonPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.string,
};

export default ComingSoonPage;
