import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore } from '@store';
import { adminService } from '../../../modules/auth/services/auth-service';
import Logo from '../../../assets/EaglesnEagletsLogo.jpeg';

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/**
 * Animated Background Component
 * Creates subtle floating particles and gradient animations
 */
const AnimatedBackground = ({ variant = 'default' }) => {
  const variants = {
    admin: 'from-slate-50 via-blue-50/30 to-indigo-50/40',
    eagle: 'from-slate-50 via-amber-50/30 to-orange-50/40',
    eaglet: 'from-slate-50 via-emerald-50/30 to-green-50/40',
    default: 'from-slate-50 via-white to-gray-50/40',
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variants[variant]} animate-gradient`} />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-float-fast" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
};

AnimatedBackground.propTypes = {
  variant: PropTypes.oneOf(['admin', 'eagle', 'eaglet', 'default']),
};

/**
 * Navigation Item Component
 */
const NavItem = ({ to, icon, label, isActive, badge, isCollapsed, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`
      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
      ${isCollapsed ? 'justify-center' : ''}
      ${isActive
        ? 'bg-primary text-white shadow-lg shadow-primary/25'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }
    `}
  >
    <span className={`material-symbols-outlined text-xl transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'} ${isCollapsed ? '' : ''}`}>
      {icon}
    </span>
    {!isCollapsed && (
      <>
        <span className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden">{label}</span>
        {badge && (
          <span className={`
            px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300
            ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-500 text-white'}
          `}>
            {badge}
          </span>
        )}
      </>
    )}
    {isCollapsed && badge && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </Link>
);

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isCollapsed: PropTypes.bool,
  onClick: PropTypes.func,
};

/**
 * DashboardLayout Component
 * Shared layout with animated sidebar and background
 */
const DashboardLayout = ({ children, variant = 'default' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const notifRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [location.pathname]);

  // Fetch admin stats for notifications & KYC badge
  const fetchAdminData = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const response = await adminService.getStats();
      if (response.success) {
        setPendingKycCount(response.data.kyc?.total_pending || 0);
        setNotifications(response.data.recent_activity || []);
      }
    } catch {
      // Silently fail
    }
  }, [user?.role]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role || 'eaglet';

    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/admin/users', icon: 'group', label: 'Users' },
        { to: '/admin/kyc', icon: 'verified_user', label: 'KYC Reviews', badge: pendingKycCount > 0 ? pendingKycCount : undefined },
        { to: '/admin/nests', icon: 'diversity_3', label: 'Nests' },
        { to: '/admin/content', icon: 'library_books', label: 'Content' },
        { to: '/admin/donations', icon: 'volunteer_activism', label: 'Donations' },
        { to: '/admin/settings', icon: 'settings', label: 'Settings' },
      ];
    }

    if (role === 'eagle') {
      return [
        { to: '/eagle/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/eagle/nests', icon: 'diversity_3', label: 'My Nests' },
        { to: '/eagle/eaglets', icon: 'group', label: 'My Eaglets' },
        { to: '/eagle/content', icon: 'upload_file', label: 'Content' },
        { to: '/eagle/messages', icon: 'chat', label: 'Messages', badge: '2' },
        { to: '/eagle/resources', icon: 'library_books', label: 'Resources' },
        { to: '/eagle/settings', icon: 'settings', label: 'Settings' },
      ];
    }

    // Eaglet (mentee)
    return [
      { to: '/eaglet/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { to: '/eaglet/nest', icon: 'diversity_1', label: 'My Nest' },
      { to: '/eaglet/assignments', icon: 'assignment', label: 'Assignments' },
      { to: '/eaglet/messages', icon: 'chat', label: 'Messages', badge: '3' },
      { to: '/eaglet/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
      { to: '/eaglet/resources', icon: 'library_books', label: 'Resources' },
      { to: '/eaglet/settings', icon: 'settings', label: 'Settings' },
    ];
  };

  const navItems = getNavItems();
  const roleDisplay = {
    admin: 'Administrator',
    eagle: 'Eagle (Mentor)',
    eaglet: 'Eaglet (Mentee)',
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen flex">
      {/* Animated Background */}
      <AnimatedBackground variant={variant} />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          bg-white/90 backdrop-blur-xl border-r border-slate-200/50
          flex flex-col transition-all duration-300 ease-out
          ${isSidebarOpen ? 'w-72' : 'w-[72px]'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with Logo and Collapse Toggle */}
        <div className={`h-16 flex items-center border-b border-slate-200/50 ${isSidebarOpen ? 'px-4 justify-between' : 'px-2 justify-center'}`}>
          <div className={`flex items-center gap-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <div className="relative group flex-shrink-0">
              <img
                src={Logo}
                alt="Eagles & Eaglets"
                className={`rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105 ${isSidebarOpen ? 'h-10 w-10' : 'h-10 w-10'}`}
              />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <h1 className="font-bold text-slate-900 text-base leading-tight truncate">Eagles & Eaglets</h1>
                <p className="text-[10px] text-slate-500 truncate">Mentorship Platform</p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? '' : 'absolute -right-3.5 top-4 bg-white shadow-md border border-slate-200'}`}
          >
            <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`}>
              chevron_left
            </span>
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`border-b border-slate-200/50 ${isSidebarOpen ? 'px-4 py-4' : 'px-2 py-3'}`}>
          <div className={`flex items-center rounded-xl transition-all duration-300 cursor-pointer group ${isSidebarOpen ? 'gap-3 p-3 bg-slate-50/80 hover:bg-slate-100' : 'justify-center p-2 hover:bg-slate-100'}`}>
            <div className="relative flex-shrink-0">
              <div className={`rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold shadow-lg transition-transform duration-300 group-hover:scale-105 ${isSidebarOpen ? 'w-10 h-10 text-sm' : 'w-10 h-10 text-sm'}`}>
                {getInitials(user?.first_name, user?.last_name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {roleDisplay[user?.role] || user?.role}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-lg group-hover:text-slate-600 transition-colors flex-shrink-0">
                  expand_more
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isCollapsed={!isSidebarOpen}
              isActive={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`border-t border-slate-200/50 ${isSidebarOpen ? 'p-3' : 'p-2'}`}>
          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? 'Log Out' : undefined}
            className={`w-full flex items-center rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group ${isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'}`}
          >
            <span className="material-symbols-outlined text-xl transition-transform duration-300 group-hover:rotate-12">
              logout
            </span>
            {isSidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="w-full relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl transition-colors group-focus-within:text-primary">
                search
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100/80 border-none text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell + Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-all duration-300 group"
              >
                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">
                  notifications
                </span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                    <span className="text-xs text-slate-400">{notifications.length} recent</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length > 0 ? notifications.slice(0, 8).map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className={`w-8 h-8 rounded-lg ${n.icon_bg} flex items-center justify-center flex-shrink-0`}>
                          <span className="material-symbols-outlined text-sm">{n.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 truncate">{n.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{timeAgo(n.timestamp)}</span>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-center">
                        <span className="material-symbols-outlined text-2xl text-slate-300">notifications_off</span>
                        <p className="text-xs text-slate-400 mt-1">No notifications</p>
                      </div>
                    )}
                  </div>
                  {user?.role === 'admin' && notifications.length > 0 && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowNotifications(false)}
                      className="block px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-primary/5 border-t border-slate-100 transition-colors"
                    >
                      View all activity
                    </Link>
                  )}
                </div>
              )}
            </div>

            <button className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-300 group">
              <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">
                help
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-40px, -20px) rotate(-10deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -20px); }
          50% { transform: translate(0, -40px); }
          75% { transform: translate(-20px, -20px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 10s ease-in-out infinite; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
      `}</style>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['admin', 'eagle', 'eaglet', 'default']),
};

export default DashboardLayout;
