import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { adminService } from '../../modules/auth/services/auth-service';

// ─── Helper ─────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon, iconBg, gradient, label, value, change, delay = 0 }) => (
  <div
    className={`group relative rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${gradient || 'bg-white/80 backdrop-blur-sm border border-slate-200/50'}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {gradient && (
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="80" cy="80" r="60" fill="currentColor" className="text-white" />
        </svg>
      </div>
    )}
    <div className="relative flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <div className={`p-2.5 rounded-xl w-fit mb-2 ${iconBg} ${gradient ? '' : 'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <p className={`text-3xl font-bold ${gradient ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {change !== undefined && change !== null && (
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              gradient ? 'bg-white/20 text-white' : change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              <span className="material-symbols-outlined text-xs">
                {change > 0 ? 'trending_up' : 'trending_down'}
              </span>
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      </div>
    </div>
  </div>
);

// ─── Chart Bar ──────────────────────────────────────────────────────────────
const ChartBar = ({ day, height, value, isHighlighted }) => (
  <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
    <div className="relative w-full flex justify-center">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-10">
        {value} users
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800" />
      </div>
      <div
        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out group-hover:scale-105 ${
          isHighlighted
            ? 'bg-primary shadow-lg shadow-primary/30'
            : 'bg-primary/30 group-hover:bg-primary/50'
        }`}
        style={{ height: `${height}%` }}
      />
    </div>
    <span className={`text-xs font-medium ${isHighlighted ? 'text-primary font-bold' : 'text-slate-400'}`}>
      {day}
    </span>
  </div>
);

// ─── Activity Item ──────────────────────────────────────────────────────────
const ActivityItem = ({ icon, icon_bg, iconBg, title, description, time, timestamp }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer">
    <div className={`w-10 h-10 rounded-xl ${icon_bg || iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-500 truncate">{description}</p>
    </div>
    <span className="text-xs text-slate-400 whitespace-nowrap">{time || timeAgo(timestamp)}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [chartLoading, setChartLoading] = useState(false);

  const fetchStats = useCallback(async (period = 'weekly') => {
    try {
      const response = await adminService.getStats({ period });
      if (response.success) {
        setStats(response.data);
      }
    } catch {
      // Silently fail — UI will show "0" for empty data
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      await fetchStats(chartPeriod);
      setIsLoading(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when chart period changes
  const handlePeriodChange = useCallback(async (newPeriod) => {
    if (newPeriod === chartPeriod) return;
    setChartPeriod(newPeriod);
    setChartLoading(true);
    await fetchStats(newPeriod);
    setChartLoading(false);
  }, [chartPeriod, fetchStats]);

  // Build chart data from recent_registrations
  const chartData = useMemo(() => {
    const regs = stats?.recent_registrations || [];

    if (chartPeriod === 'monthly') {
      // Monthly view: show last 4 weeks
      const weekLabels = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const dateStr = weekStart.toISOString().split('T')[0];
        const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const match = regs.find((r) => {
          const regDate = typeof r.date === 'string' ? r.date : r.date;
          return regDate === dateStr;
        });
        weekLabels.push({
          day: `Wk ${label}`,
          value: match?.count || 0,
          date: dateStr,
        });
      }

      const maxVal = Math.max(...weekLabels.map((d) => d.value), 1);
      return weekLabels.map((d, idx) => ({
        ...d,
        height: Math.max(5, (d.value / maxVal) * 100),
        isHighlighted: idx === weekLabels.length - 1,
      }));
    }

    // Weekly view: show last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = regs.find((r) => {
        const regDate = typeof r.date === 'string' ? r.date : r.date;
        return regDate === dateStr;
      });
      days.push({
        day: dayNames[d.getDay()],
        value: match?.count || 0,
        date: dateStr,
      });
    }

    const maxVal = Math.max(...days.map((d) => d.value), 1);
    return days.map((d, idx) => ({
      ...d,
      height: Math.max(5, (d.value / maxVal) * 100),
      isHighlighted: idx === days.length - 1,
    }));
  }, [stats, chartPeriod]);

  // Total registrations for the period
  const totalChartRegistrations = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.value, 0);
  }, [chartData]);

  // Derived values
  const totalUsers = stats?.users?.total || 0;
  const totalEagles = stats?.users?.eagles || 0;
  const totalEaglets = stats?.users?.eaglets || 0;
  const pendingKYC = stats?.kyc?.total_pending || 0;
  const recentActivity = stats?.recent_activity || [];

  return (
    <DashboardLayout variant="admin">
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {user?.first_name || 'Admin'}. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-300 flex items-center gap-2 hover:shadow-md">
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105">
              <span className="material-symbols-outlined text-lg">add</span>
              Add User
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="group"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            label="Total Users"
            value={isLoading ? '...' : totalUsers.toLocaleString()}
            delay={0}
          />
          <StatCard
            icon="school"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            label="Eagles (Mentors)"
            value={isLoading ? '...' : totalEagles.toLocaleString()}
            delay={100}
          />
          <StatCard
            icon="person"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            label="Eaglets (Mentees)"
            value={isLoading ? '...' : totalEaglets.toLocaleString()}
            delay={200}
          />
          <Link to="/admin/kyc" className="block">
            <StatCard
              icon="pending_actions"
              iconBg="bg-white/20 text-white"
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
              label="Pending KYC Reviews"
              value={isLoading ? '...' : pendingKYC}
              delay={300}
            />
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Growth Analytics</h3>
                <p className="text-sm text-slate-500">
                  {chartPeriod === 'weekly' ? 'New registrations this week' : 'New registrations this month'}
                  {!isLoading && !chartLoading && (
                    <span className="ml-2 font-semibold text-primary">
                      ({totalChartRegistrations} total)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
                    chartPeriod === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
                    chartPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="relative h-52 w-full flex items-end justify-between gap-2 md:gap-4 pt-4">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-slate-100 w-full h-0" />
                ))}
              </div>

              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl animate-spin text-slate-400">progress_activity</span>
                </div>
              ) : (
                chartData.map((data) => (
                  <ChartBar key={data.date || data.day} {...data} />
                ))
              )}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Stats</h3>
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">school</span>
                  </div>
                  <span className="font-medium text-slate-700">Eagles</span>
                </div>
                <span className="text-xl font-bold text-slate-900">
                  {isLoading ? '...' : totalEagles.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">person</span>
                  </div>
                  <span className="font-medium text-slate-700">Eaglets</span>
                </div>
                <span className="text-xl font-bold text-slate-900">
                  {isLoading ? '...' : totalEaglets.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600">block</span>
                  </div>
                  <span className="font-medium text-slate-700">Suspended</span>
                </div>
                <span className="text-xl font-bold text-slate-900">
                  {isLoading ? '...' : (stats?.users?.suspended || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-500">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl animate-spin mb-2">progress_activity</span>
                  <p className="text-sm">Loading activity...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">inbox</span>
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/kyc"
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Review KYC Applications</p>
                  <p className="text-xs text-slate-500">{pendingKYC} pending reviews</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Manage Users</p>
                  <p className="text-xs text-slate-500">{totalUsers} total users</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </Link>

              <Link
                to="/admin/content"
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">library_books</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Manage Content</p>
                  <p className="text-xs text-slate-500">Videos, courses & resources</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </Link>

              <Link
                to="/admin/donations"
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">volunteer_activism</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">View Donations</p>
                  <p className="text-xs text-slate-500">Track donation activity</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
