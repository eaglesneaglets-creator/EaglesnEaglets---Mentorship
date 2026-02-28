import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';

/**
 * Stat Card with Icon Background
 */
const StatCard = ({ icon, iconColor, label, value, subValue, subColor = 'text-emerald-600', progress, delay = 0 }) => (
  <div
    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Background Icon */}
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${iconColor}`}>
      <span className="material-symbols-outlined text-6xl">{icon}</span>
    </div>

    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <div className="flex items-baseline gap-2 mt-1">
      <p className="text-slate-900 text-2xl font-bold">{value}</p>
      {subValue && (
        <p className={`text-xs font-bold ${subColor}`}>{subValue}</p>
      )}
    </div>

    {progress !== undefined && (
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

/**
 * Content Item Component
 */
const ContentItem = ({ icon, iconBg, title, subtitle, rightElement, delay = 0 }) => (
  <div
    className="flex items-center gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-slate-900 text-base font-medium truncate">{title}</h4>
      <p className="text-slate-500 text-sm truncate">{subtitle}</p>
    </div>
    {rightElement}
  </div>
);

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
const LeaderboardRow = ({ rank, name, points, avatar, isYou = false, rankColor }) => (
  <div className={`flex items-center gap-3 p-3 transition-colors duration-300 ${
    isYou ? 'bg-blue-50/80 rounded-xl' : 'hover:bg-slate-50 border-b border-slate-100 last:border-0'
  }`}>
    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rankColor}`}>
      {rank}
    </span>
    {avatar ? (
      <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
        {name.charAt(0)}
      </div>
    )}
    <p className={`flex-1 text-sm ${isYou ? 'font-bold text-primary' : 'font-medium text-slate-900'}`}>
      {isYou ? 'You' : name}
    </p>
    <p className="text-xs font-bold text-emerald-600">{points.toLocaleString()} pts</p>
  </div>
);

/**
 * Eaglet Dashboard Page
 */
const EagletDashboardPage = () => {
  const { user } = useAuthStore();

  // Mock data
  const stats = [
    { icon: 'psychiatry', iconColor: 'text-emerald-500', label: 'Spiritual Points', value: '1,240', subValue: '+120 this week', progress: 65 },
    { icon: 'school', iconColor: 'text-blue-500', label: 'Modules Completed', value: '12', subValue: '/ 40', subColor: 'text-slate-400' },
    { icon: 'local_fire_department', iconColor: 'text-orange-500', label: 'Prayer Streak', value: '5 Days', subValue: 'Personal best!', subColor: 'text-emerald-600' },
    { icon: 'menu_book', iconColor: 'text-purple-500', label: 'Scriptures Memorized', value: '24', subValue: '+3 since last session' },
  ];

  const recentContent = [
    {
      icon: 'play_circle',
      iconBg: 'bg-blue-50 text-primary',
      title: 'Understanding Grace - Part 2',
      subtitle: 'Video Module • 15 mins',
      rightElement: (
        <button className="p-2 text-primary hover:bg-blue-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      ),
    },
    {
      icon: 'menu_book',
      iconBg: 'bg-emerald-50 text-emerald-600',
      title: 'Weekly Devotional: Patience',
      subtitle: 'Reading • 5 mins remaining',
      rightElement: (
        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-3/4" />
        </div>
      ),
    },
    {
      icon: 'quiz',
      iconBg: 'bg-purple-50 text-purple-600',
      title: 'Foundations Quiz',
      subtitle: 'Assignment • Due Tomorrow',
      rightElement: (
        <span className="px-2.5 py-1 text-xs font-bold bg-orange-50 text-orange-600 rounded-lg animate-pulse">
          Due Soon
        </span>
      ),
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah M.', points: 1450, rankColor: 'bg-amber-100 text-amber-700' },
    { rank: 2, name: 'James L.', points: 1320, rankColor: 'bg-slate-100 text-slate-600' },
    { rank: 3, name: user?.first_name || 'You', points: 1240, isYou: true, rankColor: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <DashboardLayout variant="eaglet">
      <div className="flex flex-col gap-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || 'Eaglet'}!
            </h1>
            <p className="text-slate-500 mt-1">Ready to continue your spiritual journey today?</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 hover:bg-slate-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
            <span className="material-symbols-outlined text-lg group-hover:animate-bounce">play_arrow</span>
            Resume Learning
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 75} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Nest & Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* My Nest Card */}
            <div className="relative overflow-hidden rounded-2xl h-72 shadow-xl group">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=400&fit=crop)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col sm:flex-row items-end justify-between gap-4">
                <div className="flex flex-col gap-2 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-emerald-400">diversity_1</span>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Current Cohort</p>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight">Eagle's Nest Alpha</h3>
                  <p className="text-slate-200 text-sm">Mentor: David Smith</p>

                  {/* Member Avatars */}
                  <div className="flex -space-x-2 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 ring-2 ring-white"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-700 ring-2 ring-white flex items-center justify-center text-white text-xs font-medium">
                      +4
                    </div>
                  </div>
                </div>

                <Link
                  to="/eaglet/nest"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                  View Nest
                </Link>
              </div>
            </div>

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
                {recentContent.map((item, index) => (
                  <ContentItem key={item.title} {...item} delay={index * 75} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Widgets */}
          <div className="flex flex-col gap-6">
            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon="add_task" iconColor="text-primary" label="Submit Assignment" />
                <QuickAction icon="chat" iconColor="text-emerald-600" label="Message Mentor" />
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="text-base font-bold text-slate-900">Leaderboard</h3>
                <span className="text-xs font-medium text-slate-500">Weekly Top</span>
              </div>

              <div className="flex flex-col">
                {leaderboard.map((item) => (
                  <LeaderboardRow key={item.rank} {...item} />
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <span className="material-symbols-outlined text-white text-2xl">schedule</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">Daily Check-In</h4>
                  <p className="text-xs text-slate-500">You haven't checked in today</p>
                </div>
              </div>
              <button className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]">
                Check In Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EagletDashboardPage;
