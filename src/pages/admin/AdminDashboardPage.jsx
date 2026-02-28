import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { adminService } from '../../modules/auth/services/auth-service';

/**
 * Stat Card Component
 */
const StatCard = ({ icon, iconBg, gradient, label, value, change, delay = 0 }) => (
  <div
    className={`group relative rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${gradient || 'bg-white/80 backdrop-blur-sm border border-slate-200/50'}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Decorative Wave */}
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
          {change !== undefined && (
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

/**
 * Chart Bar Component
 */
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

/**
 * Recent Activity Item Component
 */
const ActivityItem = ({ icon, iconBg, title, description, time }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer">
    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-500 truncate">{description}</p>
    </div>
    <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
  </div>
);

/**
 * Admin Dashboard Page
 * Clean platform overview without integrated KYC
 */
const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('weekly');

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch {
        // Use fallback data if API fails
        setStats({
          total_users: 12450,
          active_nests: 856,
          total_donations: 45200,
          pending_kyc: 4,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock chart data
  const chartData = [
    { day: 'Mon', value: 400, height: 40 },
    { day: 'Tue', value: 650, height: 65 },
    { day: 'Wed', value: 500, height: 50 },
    { day: 'Thu', value: 850, height: 85 },
    { day: 'Fri', value: 700, height: 70, isHighlighted: true },
    { day: 'Sat', value: 450, height: 45 },
    { day: 'Sun', value: 300, height: 30 },
  ];

  // Mock recent activity
  const recentActivity = [
    { icon: 'person_add', iconBg: 'bg-emerald-100 text-emerald-600', title: 'New user registered', description: 'John Doe joined as an Eaglet', time: '2 min ago' },
    { icon: 'verified_user', iconBg: 'bg-blue-100 text-blue-600', title: 'KYC Approved', description: 'Mary Smith mentor application approved', time: '15 min ago' },
    { icon: 'volunteer_activism', iconBg: 'bg-amber-100 text-amber-600', title: 'New donation', description: '$500 donation received', time: '1 hour ago' },
    { icon: 'diversity_3', iconBg: 'bg-purple-100 text-purple-600', title: 'New Nest created', description: 'Tech Leaders nest by David Chen', time: '3 hours ago' },
    { icon: 'upload_file', iconBg: 'bg-indigo-100 text-indigo-600', title: 'Content uploaded', description: 'New video course: Leadership 101', time: '5 hours ago' },
  ];

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
            value={isLoading ? '...' : (stats?.total_users?.toLocaleString() || '12,450')}
            change={8}
            delay={0}
          />
          <StatCard
            icon="diversity_3"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            label="Active Nests"
            value={isLoading ? '...' : (stats?.active_nests?.toLocaleString() || '856')}
            change={12}
            delay={100}
          />
          <StatCard
            icon="volunteer_activism"
            iconBg="bg-white/20 text-white"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            label="Total Donations"
            value={isLoading ? '...' : `$${(stats?.total_donations || 45200).toLocaleString()}`}
            change={23}
            delay={200}
          />
          <Link to="/admin/kyc" className="block">
            <StatCard
              icon="pending_actions"
              iconBg="bg-white/20 text-white"
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
              label="Pending KYC Reviews"
              value={isLoading ? '...' : (stats?.pending_kyc || 4)}
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
                <p className="text-sm text-slate-500">New registrations this week</p>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setChartPeriod('weekly')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
                    chartPeriod === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
                    chartPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="relative h-52 w-full flex items-end justify-between gap-2 md:gap-4 pt-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-slate-100 w-full h-0" />
                ))}
              </div>
              {chartData.map((data) => (
                <ChartBar key={data.day} {...data} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
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
                <span className="text-xl font-bold text-slate-900">1,234</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">person</span>
                  </div>
                  <span className="font-medium text-slate-700">Eaglets</span>
                </div>
                <span className="text-xl font-bold text-slate-900">11,216</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600">library_books</span>
                  </div>
                  <span className="font-medium text-slate-700">Content Items</span>
                </div>
                <span className="text-xl font-bold text-slate-900">2,847</span>
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
                <button className="text-sm text-primary font-medium hover:underline">View All</button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
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
                  <p className="text-xs text-slate-500">{stats?.pending_kyc || 4} pending reviews</p>
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
                  <p className="text-xs text-slate-500">View all platform users</p>
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
