import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useAdminDashboardStats } from '../../modules/analytics/hooks/useAnalytics';
import { formatRelativeTime } from '../../shared/utils';
import StatCard from '../../shared/components/ui/StatCard';

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs py-2 px-3 rounded-xl shadow-xl">
      <p className="font-semibold text-slate-300 mb-0.5">{label}</p>
      <p className="font-bold">{payload[0].value} user{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

// ─── Activity Item ──────────────────────────────────────────────────────────
const ActivityItem = ({ icon, icon_bg, iconBg, title, description, time, timestamp }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50/80 transition-all duration-500 ease-out group cursor-pointer hover:shadow-sm hover:border-slate-200/50 border border-transparent">
    <div className={`w-10 h-10 rounded-xl ${icon_bg || iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3`}>
      <span className="material-symbols-outlined text-lg transition-transform duration-500 group-hover:-translate-y-0.5">{icon}</span>
    </div>
    <div className="flex-1 min-w-0 transition-transform duration-500 ease-out group-hover:translate-x-1">
      <p className="font-semibold text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-500 truncate">{description}</p>
    </div>
    <span className="text-xs text-slate-400 whitespace-nowrap transition-transform duration-500 group-hover:-translate-x-1">{time || formatRelativeTime(timestamp)}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [chartType, setChartType] = useState('bar');

  const { data: stats, isLoading, isError, isFetching } = useAdminDashboardStats(chartPeriod);
  const chartLoading = isFetching && !isLoading;

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod !== chartPeriod) setChartPeriod(newPeriod);
  };

  // Helper: format date as YYYY-MM-DD using local timezone (matches backend TruncDate)
  const toLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Build chart data from recent_registrations
  const chartData = useMemo(() => {
    const regs = stats?.recent_registrations || [];

    // Match helper: sum counts for a date range (week) or exact date
    const findCount = (dateStr) => {
      const match = regs.find((r) => r.date === dateStr);
      return match?.count || 0;
    };

    if (chartPeriod === 'monthly') {
      // Monthly view: show last 4 weeks, sum each week's daily counts
      const weekLabels = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Sum all days in this week
        let weekTotal = 0;
        for (let day = 0; day < 7; day++) {
          const wd = new Date(weekStart);
          wd.setDate(wd.getDate() + day);
          weekTotal += findCount(toLocalDateStr(wd));
        }

        weekLabels.push({
          day: `Wk ${label}`,
          value: weekTotal,
          date: toLocalDateStr(weekStart),
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
      const dateStr = toLocalDateStr(d);
      days.push({
        day: dayNames[d.getDay()],
        value: findCount(dateStr),
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

  if (isError) {
    return (
      <DashboardLayout variant="admin">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">cloud_off</span>
            <p className="text-slate-500 font-medium">Failed to load dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="admin">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Welcome back, {user?.first_name || 'Admin'}. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              title="Coming soon"
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 opacity-60 cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 md:mb-6 gap-2 sm:gap-3">
              <div>
                <h3 className="text-sm md:text-lg font-bold text-slate-900">User Growth Analytics</h3>
                <p className="text-xs text-slate-500">
                  {chartPeriod === 'weekly' ? 'New registrations this week' : 'New registrations this month'}
                  {!isLoading && !chartLoading && (
                    <span className="ml-1 font-semibold text-primary">
                      ({totalChartRegistrations} total)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                {/* Chart type toggle */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('bar')}
                    title="Bar chart"
                    className={`px-2.5 py-1.5 rounded-md transition-all duration-300 ${chartType === 'bar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">bar_chart</span>
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    title="Line chart"
                    className={`px-2.5 py-1.5 rounded-md transition-all duration-300 ${chartType === 'line' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">show_chart</span>
                  </button>
                </div>
                {/* Period toggle */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => handlePeriodChange('weekly')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${chartPeriod === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => handlePeriodChange('monthly')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${chartPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-44 md:h-52 w-full">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl animate-spin text-slate-400">progress_activity</span>
                </div>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} domain={[0, (dataMax) => Math.max(dataMax, 3)]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} minPointSize={totalChartRegistrations === 0 ? 0 : 2} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} domain={[0, (dataMax) => Math.max(dataMax, 3)]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#059669' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow duration-500 flex flex-col">
            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4">Platform Stats</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                className="relative flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 hover:bg-white/90 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div className="flex-1 z-10">
                  <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors duration-300">Review KYC Applications</p>
                  <p className="text-xs text-slate-500">{pendingKYC} pending reviews</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300 z-10 bg-white/50 backdrop-blur rounded-lg p-1">arrow_forward</span>
              </Link>

              <Link
                to="/admin/users"
                className="relative flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 hover:bg-white/90 hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div className="flex-1 z-10">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-500 transition-colors duration-300">Manage Users</p>
                  <p className="text-xs text-slate-500">{totalUsers} total users</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300 z-10 bg-white/50 backdrop-blur rounded-lg p-1">arrow_forward</span>
              </Link>

              <Link
                to="/admin/content"
                className="relative flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 hover:bg-white/90 hover:border-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/5 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 z-10">
                  <span className="material-symbols-outlined">library_books</span>
                </div>
                <div className="flex-1 z-10">
                  <p className="font-semibold text-slate-900 group-hover:text-purple-500 transition-colors duration-300">Manage Content</p>
                  <p className="text-xs text-slate-500">Videos, courses & resources</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300 z-10 bg-white/50 backdrop-blur rounded-lg p-1">arrow_forward</span>
              </Link>

              <Link
                to="/admin/donations"
                className="relative flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 hover:bg-white/90 hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10">
                  <span className="material-symbols-outlined">volunteer_activism</span>
                </div>
                <div className="flex-1 z-10">
                  <p className="font-semibold text-slate-900 group-hover:text-amber-500 transition-colors duration-300">View Donations</p>
                  <p className="text-xs text-slate-500">Track donation activity</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform duration-300 z-10 bg-white/50 backdrop-blur rounded-lg p-1">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
