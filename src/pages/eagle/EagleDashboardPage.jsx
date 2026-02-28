import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';

/**
 * Stat Card Component for Eagle Dashboard
 */
const StatCard = ({ icon, iconBg, label, value, hoverBorder, delay = 0 }) => (
  <div
    className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden hover:border-${hoverBorder}/30`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Shimmer Effect */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    <div className="relative flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-slate-900 text-3xl font-bold">{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
    </div>
  </div>
);

/**
 * Nest Card Component
 */
const NestCard = ({ title, description, image, icon, iconColor, eagletCount, meetingDay, delay = 0 }) => (
  <div
    className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Cover Image */}
    <div className="h-28 w-full bg-cover bg-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </div>

    {/* Content */}
    <div className="p-5 relative">
      {/* Floating Icon */}
      <div className={`absolute -top-7 right-5 w-12 h-12 rounded-xl border-2 border-white bg-white shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${iconColor}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <h3 className="font-bold text-lg text-slate-900 pr-14">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-1">{description}</p>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
          <span className="material-symbols-outlined text-sm">group</span>
          {eagletCount} Eaglets
        </span>
        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
          <span className="material-symbols-outlined text-sm">event</span>
          {meetingDay}
        </span>
      </div>
    </div>
  </div>
);

/**
 * Eaglet Performance Row
 */
const EagletRow = ({ eaglet, delay = 0 }) => {
  const statusConfig = {
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
    behind: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Behind' },
    review: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Review' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Completed' },
  };
  const config = statusConfig[eaglet.status] || statusConfig.active;

  return (
    <tr
      className="group hover:bg-slate-50/80 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <td className="py-4">
        <div className="flex items-center gap-3">
          {eaglet.avatar ? (
            <img src={eaglet.avatar} alt={eaglet.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {eaglet.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-slate-900">{eaglet.name}</p>
            <p className="text-xs text-slate-500">{eaglet.nest}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <p className="text-sm text-slate-900 font-medium">{eaglet.module}</p>
        <p className="text-xs text-slate-500">{eaglet.dueDate}</p>
      </td>
      <td className="py-4">
        <div className="w-full max-w-[120px]">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                eaglet.progress >= 75 ? 'bg-primary' : eaglet.progress >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${eaglet.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">{eaglet.progress}%</p>
        </div>
      </td>
      <td className="py-4 text-right">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </td>
    </tr>
  );
};

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
const SessionCard = ({ title, time, date, month, attendees, isUpcoming = false }) => (
  <div className={`flex gap-4 items-start p-4 rounded-xl transition-all duration-300 ${
    isUpcoming
      ? 'bg-slate-50 border-l-4 border-primary shadow-sm'
      : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200'
  }`}>
    <div className="flex flex-col items-center min-w-[3rem]">
      <span className="text-xs font-bold text-slate-500 uppercase">{month}</span>
      <span className="text-2xl font-bold text-slate-900">{date}</span>
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-sm text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 mb-2">{time}</p>
      {attendees && (
        <div className="flex -space-x-2">
          {attendees.slice(0, 3).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-slate-300 ring-2 ring-white" />
          ))}
          {attendees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-[8px] font-bold text-slate-600">
              +{attendees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

/**
 * Eagle Dashboard Page
 */
const EagleDashboardPage = () => {
  const { user } = useAuthStore();
  const [currentMonth] = useState('Oct 2023');

  // Mock data
  const nests = [
    {
      id: 1,
      title: 'Alpha Cohort 2023',
      description: 'Foundational Theology & Leadership',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop',
      icon: 'school',
      iconColor: 'text-primary',
      eagletCount: 8,
      meetingDay: 'Tuesdays',
    },
    {
      id: 2,
      title: 'Beta Discipleship',
      description: 'Advanced Spiritual Formation',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
      icon: 'light_mode',
      iconColor: 'text-amber-600',
      eagletCount: 4,
      meetingDay: 'Fridays',
    },
  ];

  const eaglets = [
    { id: 1, name: 'Sarah Jenkins', nest: 'Alpha Nest', module: 'Servant Leadership', dueDate: 'Due in 2 days', progress: 75, status: 'active' },
    { id: 2, name: 'Michael Chen', nest: 'Beta Nest', module: 'Biblical Ethics', dueDate: 'Due today', progress: 45, status: 'behind' },
    { id: 3, name: 'David Okonjo', nest: 'Alpha Nest', module: 'Servant Leadership', dueDate: 'Completed', progress: 100, status: 'review' },
  ];

  const sessions = [
    { id: 1, title: 'Alpha Nest Weekly', time: '2:00 PM - 3:30 PM', month: 'Oct', date: '05', attendees: Array(8).fill(null), isUpcoming: true },
    { id: 2, title: '1:1 Mentorship', time: 'With Michael Chen • 10:00 AM', month: 'Oct', date: '10', attendees: null, isUpcoming: false },
  ];

  // Calendar days (simplified)
  const calendarDays = [
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    ...Array.from({ length: 12 }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
      isToday: i + 1 === 5,
      hasEvent: i + 1 === 10,
    })),
  ];

  return (
    <DashboardLayout variant="eagle">
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || 'Mentor'}
            </h1>
            <p className="text-slate-500 mt-1">
              Here is an overview of your mentorship activities and eaglet progress.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
            Upload Content
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon="group"
                iconBg="bg-blue-50 text-primary"
                label="Total Eaglets"
                value="12"
                hoverBorder="primary"
                delay={0}
              />
              <StatCard
                icon="person_add"
                iconBg="bg-amber-50 text-amber-600"
                label="Pending Requests"
                value="3"
                hoverBorder="amber-500"
                delay={100}
              />
              <StatCard
                icon="military_tech"
                iconBg="bg-emerald-50 text-emerald-600"
                label="Points Awarded"
                value="450"
                hoverBorder="emerald-500"
                delay={200}
              />
            </div>

            {/* My Nests Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">My Nests</h2>
                <Link to="/eagle/nests" className="text-primary text-sm font-medium hover:underline flex items-center gap-1 group">
                  View All
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nests.map((nest, index) => (
                  <NestCard key={nest.id} {...nest} delay={index * 100} />
                ))}
              </div>
            </div>

            {/* Eaglet Performance Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-500">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pt-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Eaglet</th>
                      <th className="pb-3 pt-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Module</th>
                      <th className="pb-3 pt-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Progress</th>
                      <th className="pb-3 pt-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eaglets.map((eaglet, index) => (
                      <EagletRow key={eaglet.id} eaglet={eaglet} delay={index * 50} />
                    ))}
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
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Calendar Widget */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm p-6 hover:shadow-lg transition-shadow duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Calendar</h2>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm text-slate-400">chevron_left</span>
                  </button>
                  <span className="text-sm font-semibold text-slate-900">{currentMonth}</span>
                  <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-xs font-medium text-slate-400 text-center py-2">
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
                {sessions.map((session) => (
                  <SessionCard key={session.id} {...session} />
                ))}
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
                <button className="w-full bg-white text-primary text-sm font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Share with Nests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EagleDashboardPage;
