import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useEagleDashboardStats } from '../../modules/analytics/hooks/useAnalytics';
import StatCard from '../../shared/components/ui/StatCard';
import AwardPointsModal from '../../modules/points/components/AwardPointsModal';
import { SkeletonCard } from '../../shared/components/ui/LoadingSkeleton';

/**
 * Eaglet Performance Row
 */
const EagletRow = ({ eaglet, delay = 0, onAwardPoints }) => {
  const statusConfig = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Active' },
    behind: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Behind' },
    review: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Review' },
    completed: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Completed' },
  };
  const config = statusConfig[eaglet.status] || statusConfig.active;

  return (
    <tr
      className="group hover:bg-slate-50/60 transition-colors duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <td className="py-4 px-2">
        <div className="flex items-center gap-3 transition-transform duration-500 ease-out group-hover:translate-x-1">
          {eaglet.avatar ? (
            <img src={eaglet.avatar} alt={eaglet.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/80 to-emerald-600/80 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform duration-500 group-hover:scale-105">
              {eaglet.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-slate-900 group-hover:text-primary transition-colors duration-300">{eaglet.name}</p>
            <p className="text-xs text-slate-500">{eaglet.nest_name || 'No Nest'}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <p className="text-sm text-slate-900 font-medium transition-transform duration-500 ease-out group-hover:translate-x-1">{eaglet.module || 'In progress'}</p>
      </td>
      <td className="py-4">
        <div className="w-full max-w-[120px] transition-transform duration-500 ease-out group-hover:translate-x-1">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-[1500ms] ease-out ${eaglet.progress >= 75 ? 'bg-primary/80' : eaglet.progress >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              style={{ width: `${eaglet.progress}%` }}
            />
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5 text-right">{eaglet.progress}%</p>
        </div>
      </td>
      <td className="py-4 text-right pr-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-500 ${config.bg} ${config.text} group-hover:shadow-sm`}>
          {config.label}
        </span>
      </td>
      <td className="py-4 text-right pr-4">
        <button
          onClick={() => onAwardPoints({ eagletId: eaglet.id, nestId: eaglet.nest_id || null })}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-sm">military_tech</span>
          Award
        </button>
      </td>
    </tr>
  );
};
/** * Eaglet Mobile Card - shown on small screens instead of table */const EagletMobileCard = ({ eaglet, delay = 0, onAwardPoints }) => {  const statusConfig = {    active: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Active' },    behind: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Behind' },    review: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Review' },    completed: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Completed' },  };  const config = statusConfig[eaglet.status] || statusConfig.active;  return (    <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-3" style={{ animationDelay: `${delay}ms` }}>      <div className="flex items-center justify-between">        <div className="flex items-center gap-3">          {eaglet.avatar ? (            <img src={eaglet.avatar} alt={eaglet.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" loading="lazy" />          ) : (            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/80 to-emerald-600/80 flex items-center justify-center text-white font-bold text-sm shadow-sm">              {eaglet.name?.charAt(0) || '?'}            </div>          )}          <div>            <p className="font-semibold text-sm text-slate-900">{eaglet.name}</p>            <p className="text-xs text-slate-500">{eaglet.nest_name || 'No Nest'}</p>          </div>        </div>        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}>          {config.label}        </span>      </div>      <div className="flex items-center gap-3">        <p className="text-xs text-slate-500 flex-shrink-0">Module:</p>        <p className="text-sm text-slate-900 font-medium truncate">{eaglet.module || 'In progress'}</p>      </div>      <div>        <div className="flex items-center justify-between mb-1">          <p className="text-xs text-slate-500">Progress</p>          <p className="text-xs font-bold text-slate-700">{eaglet.progress}%</p>        </div>        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">          <div            className={`h-2 rounded-full transition-all duration-1000 ${eaglet.progress >= 75 ? 'bg-primary/80' : eaglet.progress >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}            style={{ width: `${eaglet.progress}%` }}          />        </div>      </div>      <button        onClick={() => onAwardPoints({ eagletId: eaglet.id, nestId: eaglet.nest_id || null })}        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 active:bg-emerald-200 transition-all"      >        <span className="material-symbols-outlined text-sm">military_tech</span>        Award Points      </button>    </div>  );};

/**
 * Calendar Day Component
 */
const CalendarDay = ({ day, isCurrentMonth = true, isToday = false, hasEvent = false }) => (
  <div className={`flex items-center justify-center py-2 relative ${!isCurrentMonth ? 'text-slate-300' : ''}`}>
    {isToday ? (
      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/30 animate-pulse">
        {day}
      </div>
    ) : (
      <span className={`text-sm ${isCurrentMonth ? 'text-slate-900 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors' : ''}`}>
        {day}
      </span>
    )}
    {hasEvent && !isToday && (
      <div className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
    )}
  </div>
);

/**
 * Session Card Component
 */
const SessionCard = ({ title, date, link, isUpcoming = false }) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString('default', { month: 'short' });
  const time = d.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-4 items-start p-4 rounded-xl transition-all duration-300 ${isUpcoming
      ? 'bg-slate-50 border-l-4 border-primary shadow-sm'
      : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200'
      }`}>
      <div className="flex flex-col items-center min-w-[3rem]">
        <span className="text-xs font-bold text-slate-500 uppercase">{month}</span>
        <span className="text-2xl font-bold text-slate-900">{day}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mb-2">{time}</p>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">link</span>
            Join Session
          </a>
        )}
      </div>
    </div>
  );
};

/**
 * Eagle Dashboard Page
 */
const EagleDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading, isError } = useEagleDashboardStats();

  const [awardModal, setAwardModal] = useState({ open: false, eagletId: null, nestId: null });
  const openAwardModal = ({ eagletId, nestId }) => setAwardModal({ open: true, eagletId, nestId });
  const closeAwardModal = () => setAwardModal({ open: false, eagletId: null, nestId: null });

  const totalEaglets = dashboardData?.total_eaglets || 0;
  const pendingRequests = dashboardData?.pending_requests || 0;
  const pointsAwarded = dashboardData?.points_awarded || 0;
  const eaglets = dashboardData?.eaglets || [];
  const sessions = dashboardData?.upcoming_sessions || [];

  // Real Calendar days logic
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonthDisplay = currentDate.toLocaleDateString('default', { month: 'short', year: 'numeric' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const calendarDays = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const isThisMonth = year === today.getFullYear() && month === today.getMonth();
    // Basic event check (assuming session.date is an ISO date string, or we fallback)
    const hasEvent = sessions.some(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getDate() === i && d.getMonth() === month && d.getFullYear() === year;
    });

    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday: isThisMonth && i === today.getDate(),
      hasEvent: hasEvent,
    });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  if (isLoading) {
    return (
      <DashboardLayout variant="eagle">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout variant="eagle">
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
    <DashboardLayout variant="eagle">
      <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || 'Mentor'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Here is an overview of your mentorship activities and eaglet progress.
            </p>
          </div>
          <button
            onClick={() => navigate('/eagle/content/upload')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
            Upload Content
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              <StatCard
                icon="group"
                iconBg="bg-blue-50 text-primary"
                label="Total Eaglets"
                value={totalEaglets}
                hoverBorder="primary"
                delay={0}
              />
              <StatCard
                icon="person_add"
                iconBg="bg-amber-50 text-amber-600"
                label="Pending Requests"
                value={pendingRequests}
                hoverBorder="amber-500"
                delay={100}
              />
              <StatCard
                icon="military_tech"
                iconBg="bg-emerald-50 text-emerald-600"
                label="Points Awarded"
                value={pointsAwarded}
                hoverBorder="emerald-500"
                delay={200}
              />
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Points Awarded Over Time */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-base text-emerald-500">military_tech</span>
                  <h3 className="font-bold text-slate-800 text-sm">Points Awarded</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">Last 8 weeks across all nests</p>
                {isLoading ? (
                  <SkeletonCard className="h-36" />
                ) : (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={dashboardData?.points_by_week ?? []} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }}
                        cursor={{ fill: '#f0fdf4' }}
                      />
                      <Bar dataKey="points" fill="#22c55e" radius={[4, 4, 0, 0]} name="Points" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Eaglet Progress Overview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-base text-blue-500">trending_up</span>
                  <h3 className="font-bold text-slate-800 text-sm">Eaglet Progress</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">Avg completion % over time</p>
                {isLoading ? (
                  <SkeletonCard className="h-36" />
                ) : (
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={dashboardData?.completion_by_week ?? []}>
                      <defs>
                        <linearGradient id="eagleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} unit="%" />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }}
                        formatter={(v) => [`${v}%`, 'Avg Completion']}
                      />
                      <Area type="monotone" dataKey="completion" stroke="#22c55e" strokeWidth={2} fill="url(#eagleGrad)" dot={false} name="Completion" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>

            {/* Eaglet Performance Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-500">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h2 className="text-xl font-bold text-slate-900">Eaglet Performance</h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-sm">sort</span>
                    Sort by
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filter
                  </button>
                </div>
              </div>
              {/* Mobile Card View */}
              <div className="sm:hidden p-3 flex flex-col gap-3">
                {eaglets.length > 0 ? (
                  eaglets.map((eaglet, index) => (
                    <EagletMobileCard key={eaglet.id} eaglet={eaglet} delay={index * 50} onAwardPoints={openAwardModal} />
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <span className="material-symbols-outlined mb-2 text-slate-400">group_off</span>
                    <p className="text-sm">No eaglets to display.</p>
                  </div>
                )}
              </div>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pt-4 px-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Eaglet</th>
                      <th className="pb-3 pt-4 px-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Module</th>
                      <th className="pb-3 pt-4 px-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Progress</th>
                      <th className="pb-3 pt-4 px-3 sm:px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="pb-3 pt-4 px-3 sm:px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eaglets.length > 0 ? (
                      eaglets.map((eaglet, index) => (
                        <EagletRow key={eaglet.id} eaglet={eaglet} delay={index * 50} onAwardPoints={openAwardModal} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          <span className="material-symbols-outlined mb-2 text-slate-400">group_off</span>
                          <p className="text-sm">No eaglets to display.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-center border-t border-slate-100">
                <Link
                  to="/eagle/eaglets"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View All Eaglets
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Widgets */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
            {/* Calendar Widget */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-6 hover:shadow-lg transition-shadow duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Calendar</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm text-slate-400">chevron_left</span>
                  </button>
                  <span className="text-sm font-semibold text-slate-900">{currentMonthDisplay}</span>
                  <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={`${day}-${i}`} className="text-xs font-medium text-slate-400 text-center py-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => (
                  <CalendarDay key={i} {...day} />
                ))}
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Upcoming Sessions */}
              <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Upcoming Sessions
              </h3>
              <div className="flex flex-col gap-3">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <SessionCard key={session.id} {...session} />
                  ))
                ) : (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-sm">No upcoming sessions.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Resource */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white p-6 shadow-xl shadow-primary/20 group">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500/30 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150" />
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-amber-300 font-medium text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-sm">star</span>
                  New Resource
                </div>
                <h3 className="font-bold text-xl mb-2">Leading with Faith</h3>
                <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                  A new guide to help your eaglets integrate faith into their professional lives.
                </p>
                <button
                  disabled
                  title="Coming soon"
                  className="w-full bg-white text-primary text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg opacity-50 cursor-not-allowed"
                >
                  Share with Nests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AwardPointsModal
        isOpen={awardModal.open}
        onClose={closeAwardModal}
        prefillEagletId={awardModal.eagletId}
        prefillNestId={awardModal.nestId}
      />
    </DashboardLayout>
  );
};

export default EagleDashboardPage;
