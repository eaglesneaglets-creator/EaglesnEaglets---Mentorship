import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useEagletDashboardStats, useCheckIn } from '../../modules/analytics/hooks/useAnalytics';
import toast from 'react-hot-toast';
import StatCard from '../../shared/components/ui/StatCard';
import AnimatedContentItem from '../../shared/components/ui/AnimatedContentItem';
import AnimatedNestCard from '../../shared/components/ui/AnimatedNestCard';
import BadgeShelf from '../../shared/components/ui/BadgeShelf';

/**
 * Quick Action Button
 */
const QuickAction = ({ icon, iconColor, label }) => (
  <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 group hover:-translate-y-1">
    <span className={`material-symbols-outlined text-2xl ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
      {icon}
    </span>
    <span className="text-xs font-bold text-slate-900 text-center">{label}</span>
  </button>
);

/**
 * Leaderboard Row
 */
const LeaderboardRow = React.memo(({ rank, name, points, avatar, isYou = false }) => {
  const rankColors = {
    1: 'bg-amber-100 text-amber-600',
    2: 'bg-slate-100 text-slate-600',
    3: 'bg-orange-100 text-orange-600',
  };
  const rankColor = rankColors[rank] || 'bg-blue-50 text-blue-600';

  return (
    <div className={`flex items-center gap-3 p-3 transition-colors duration-300 ${isYou ? 'bg-blue-50/80 rounded-xl' : 'hover:bg-slate-50 border-b border-slate-100 last:border-0'
      }`}>
      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rankColor}`}>
        {rank}
      </span>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          loading="lazy"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
          {name?.charAt(0) || '?'}
        </div>
      )}
      <p className={`flex-1 text-sm ${isYou ? 'font-bold text-primary' : 'font-medium text-slate-900'}`}>
        {isYou ? 'You' : name}
      </p>
      <p className="text-xs font-bold text-emerald-600">{points?.toLocaleString()} pts</p>
    </div>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

/**
 * Eaglet Dashboard Page
 */
const EagletDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: dashboardData } = useEagletDashboardStats();
  const { mutate: checkIn, isLoading: isCheckingIn } = useCheckIn();

  const points = dashboardData?.points || 0;
  const modulesCompleted = dashboardData?.modules_completed || 0;
  const streak = dashboardData?.streak || 0;
  const hasCheckedInToday = dashboardData?.has_checked_in_today || false;
  const weeklyCheckins = dashboardData?.weekly_checkins || [false, false, false, false, false, false, false];

  const handleCheckIn = () => {
    checkIn(null, {
      onSuccess: () => {
        toast.success('Awesome! You earned 10 points for checking in.');
      },
      onError: (error) => {
        toast.error(error.message || 'Check-in failed');
      }
    });
  };

  // Use dynamic or fallback
  const stats = [
    { icon: 'psychiatry', iconColor: 'text-emerald-500', label: 'Spiritual Points', value: points.toLocaleString(), subValue: 'Keep earning!', progress: Math.min((points % 1000) / 10, 100) },
    { icon: 'school', iconColor: 'text-blue-500', label: 'Modules Completed', value: modulesCompleted.toString(), subValue: 'Total completed', subColor: 'text-slate-400' },
    { icon: 'local_fire_department', iconColor: 'text-orange-500', label: 'Prayer Streak', value: `${streak} Days`, subValue: 'Keep it going!', subColor: 'text-emerald-600' },
    { icon: 'menu_book', iconColor: 'text-purple-500', label: 'Recent Action', value: 'Active', subValue: 'Based on logs' },
  ];

  const recentContent = dashboardData?.recent_content || [];
  const leaderboard = dashboardData?.leaderboard_preview || [];

  return (
    <DashboardLayout variant="eaglet">
      <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="pl-3 border-l-4 border-primary/40 sm:pl-0 sm:border-l-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || 'Eaglet'}!
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Ready to continue your spiritual journey today?</p>
          </div>
          <button
            onClick={() => navigate('/eaglet/assignments')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 hover:bg-slate-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:animate-bounce">play_arrow</span>
            Resume Learning
          </button>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">My Badges</h3>
          </div>
          <BadgeShelf />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 75} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
            {dashboardData?.nests && dashboardData.nests.length > 0 ? (
              dashboardData.nests.map((nest, index) => (
                <AnimatedNestCard
                  key={nest.id}
                  title={nest.name}
                  description={`Learn to fly with our amazing community in ${nest.name}.`}
                  memberCount="Active"
                  additionalInfo={`Mentor: ${nest.eagle_name}`}
                  linkTo="/eaglet/nest"
                  delay={index * 100}
                />
              ))
            ) : dashboardData?.pending_requests > 0 ? (
              <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-amber-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined">hourglass_empty</span>
                    Request Pending Review
                  </h3>
                  <p className="text-amber-700/80 text-sm">
                    You have requested to join a Nest. Your Eagle mentor will review this soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-slate-900 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">diversity_3</span>
                    Join a Community
                  </h3>
                  <p className="text-slate-500 text-sm">
                    You haven't joined a Nest yet. Browse available Eagles and request a mentor.
                  </p>
                </div>
                <Link to="/eaglet/nest" className="whitespace-nowrap inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-0.5">
                  <span className="material-symbols-outlined text-base">diversity_3</span>
                  Browse Nests
                </Link>
              </div>
            )}

            {/* Recent Content Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Recent Content</h2>
                <Link
                  to="/eaglet/resources"
                  className="text-primary text-sm font-medium hover:underline flex items-center gap-1 group"
                >
                  View All
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {recentContent.length > 0 ? (
                  recentContent.map((item, index) => {
                    const iconMap = {
                      link: 'link',
                      document: 'description',
                      file: 'attachment',
                      video: 'play_circle',
                    };
                    const typeLabels = {
                      link: 'Resource Link',
                      document: 'Document',
                      file: 'File Attachment',
                      video: 'Video Resource',
                    };

                    return (
                      <AnimatedContentItem
                        key={item.id || index}
                        icon={iconMap[item.type] || 'article'}
                        iconBg="bg-blue-50 text-blue-600"
                        title={item.title}
                        subtitle={`${item.nestName} • ${typeLabels[item.type] || item.type}`}
                        rightElement={
                          <span className="text-[10px] font-bold text-blue-600 uppercase">New</span>
                        }
                        delay={index * 75}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-400 text-sm italic">No recent content available in your nests.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="flex flex-col gap-6">
            {/* Streak Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Daily Check-in</h3>
                <div className="flex items-center gap-1 text-emerald-600">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  <span className="text-sm font-bold">{streak} day streak</span>
                </div>
              </div>

              <div className="flex justify-between items-center gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                  const isChecked = weeklyCheckins[i];
                  return (
                    <div key={`${day}-${i}`} className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isChecked
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110'
                        : 'bg-slate-100 text-slate-400'
                        }`}>
                        {isChecked ? (
                          <span className="material-symbols-outlined text-sm">check</span>
                        ) : day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="text-base font-bold text-slate-900">Leaderboard</h3>
                <span className="text-xs font-medium text-slate-500">Weekly Top</span>
              </div>

              <div className="flex flex-col">
                {leaderboard.map((item, index) => (
                  <LeaderboardRow key={item.id || index} rank={index + 1} {...item} />
                ))}
              </div>

              <div className="p-3 text-center border-t border-slate-100">
                <Link
                  to="/eaglet/leaderboard"
                  className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                >
                  View Full Leaderboard
                </Link>
              </div>
            </div>

            {/* Daily Verse Widget */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 shadow-xl shadow-emerald-500/20 group">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-transform duration-500 group-hover:scale-150" />
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-emerald-500/30 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-start gap-2 mb-3">
                  <span className="material-symbols-outlined opacity-80">format_quote</span>
                  <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Daily Verse</p>
                </div>
                <p className="text-sm italic font-medium leading-relaxed mb-4">
                  "But those who hope in the Lord will renew their strength. They will soar on wings like eagles..."
                </p>
                <p className="text-xs font-bold text-right opacity-90">— Isaiah 40:31</p>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Check-In Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${hasCheckedInToday ? 'from-emerald-400 to-emerald-600' : 'from-amber-400 to-orange-500'} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <span className="material-symbols-outlined text-white text-2xl">
                    {hasCheckedInToday ? 'verified' : 'schedule'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">Daily Check-In</h4>
                  <p className="text-xs text-slate-500">
                    {hasCheckedInToday ? "You're all set for today!" : "Don't forget to check in today"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={hasCheckedInToday || isCheckingIn}
                className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] ${hasCheckedInToday
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-primary text-white shadow-primary/25 hover:shadow-primary/30'
                  }`}
              >
                {isCheckingIn ? 'Checking in...' : hasCheckedInToday ? 'Checked In' : 'Check In Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EagletDashboardPage;
