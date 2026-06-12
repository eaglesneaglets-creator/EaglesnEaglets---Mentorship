import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore, useLockedFeatures, useCurrentMode, useIsStackedAdmin } from '@store';
import { LockedFeatureModal } from '@shared/components/feature-lock/LockedFeatureModal';
import RoleSwitcher from './RoleSwitcher';
import { refreshAccessToken } from '../../../api';
import { adminService } from '../../../modules/auth/services/auth-service';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useNotificationSocket } from '../../../modules/notifications/hooks/useNotifications';
import { resolveNotificationUrl } from '../../../modules/notifications/utils/resolve-notification-url';
import { useTotalUnread } from '../../../modules/chat/hooks/useChat';
import Logo from '../../../assets/EaglesnEagletsLogo.jpeg';

import { formatRelativeTime } from '../../../shared/utils';

const EMPTY_LOCKED_FEATURES = [];

/**
 * Animated Background Component
 * Creates subtle floating particles and gradient animations
 */
const AnimatedBackground = ({ variant = 'default' }) => {
  const variants = {
    admin: 'from-blue-50 via-indigo-50/30 to-slate-50',
    eagle: 'from-amber-50 via-orange-50/30 to-slate-50',
    eaglet: 'from-emerald-50 via-emerald-50/30 to-slate-50',
    default: 'from-slate-50 via-white to-gray-50/40',
  };

  const dotColors = {
    eaglet: 'rgba(16, 185, 129, 0.06)',
    eagle:  'rgba(245, 158, 11, 0.06)',
    admin:  'rgba(99, 102, 241, 0.06)',
    default: 'rgba(100, 116, 139, 0.05)',
  };
  const dotColor = dotColors[variant] || dotColors.default;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variants[variant]} animate-gradient`} />

      {/* Animated dot-grid — subtle diagonal drift */}
      <div
        className="absolute inset-0 animate-dot-grid"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-slow opacity-80" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-float-medium opacity-60" />

      {/* Grid Pattern — subtle structural lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
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
const NavItem = React.memo(({ to, icon, label, isActive, badge, isCollapsed, onClick, isLocked }) => {
  const handleClick = (e) => {
    if (isLocked) {
      e.preventDefault();
    }
    onClick?.(e);
  };

  return (
  <Link
    to={isLocked ? '#' : to}
    onClick={handleClick}
    title={isCollapsed ? label : undefined}
    aria-disabled={isLocked || undefined}
    className={`
      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
      ${isCollapsed ? 'justify-center' : ''}
      ${isActive
        ? 'bg-primary text-white shadow-lg shadow-primary/25'
        : isLocked
          ? 'text-slate-400 hover:bg-slate-50'
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
        {isLocked && (
          <span className="material-symbols-outlined text-base text-slate-400" aria-label="Locked">
            lock
          </span>
        )}
        {badge && !isLocked && (
          <span className={`
            px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300
            ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-500 text-white'}
          `}>
            {badge}
          </span>
        )}
      </>
    )}
    {isCollapsed && isLocked && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-[10px] text-white">lock</span>
      </span>
    )}
    {isCollapsed && badge && !isLocked && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </Link>
  );
});

NavItem.displayName = 'NavItem';

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isCollapsed: PropTypes.bool,
  onClick: PropTypes.func,
  isLocked: PropTypes.bool,
};

/**
 * DashboardLayout Component
 * Shared layout with animated sidebar and background
 */
const DashboardLayout = ({
  children,
  variant = 'default',
  fullWidth = false,
  noPadding = false,
  hideHeader = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  // Role-switcher mode (plan 18-03). Drives sidebar nav swap + amber stripe.
  const currentMode = useCurrentMode();
  const isStackedAdmin = useIsStackedAdmin();
  // Persist sidebar collapse across route changes. Each page mounts its own
  // DashboardLayout instance, so without persistence the sidebar resets to
  // expanded on every nav click. Read once on mount, write on every toggle.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('ee_sidebar_open');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('ee_sidebar_open', String(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const notifRef = useRef(null);

  // Rehydrate access token on page refresh.
  // The refresh token is read from localStorage and sent in the body.
  // This MUST run before any authenticated React Query hooks fire.
  const { accessToken, setAccessToken } = useAuthStore();
  const [tokenReady, setTokenReady] = useState(!!accessToken);
  useEffect(() => {
    if (!accessToken) {
      refreshAccessToken()
        .then((token) => {
          if (token) {
            setAccessToken(token);
          }
          setTokenReady(true);
        })
        .catch(() => {
          setTokenReady(true); // session expired — AuthGuard will redirect
        });
    } else {
      setTokenReady(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh access_status on mount + window focus so sidebar lock visuals
  // reflect mentor approvals + KYC state changes without requiring a logout.
  const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);
  useEffect(() => {
    if (!tokenReady || !refreshAccessStatus) return;
    refreshAccessStatus();
    const onFocus = () => refreshAccessStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [tokenReady, refreshAccessStatus]);

  // Real unread chat count for sidebar badge.
  // Gate on tokenReady (no 401 on refresh) AND on chat being unlocked
  // (eaglets without active program get 403 NoActiveProgramDenied on chat APIs).
  const accessStatusForChat = useAuthStore((s) => s.accessStatus);
  const lockedFeaturesEarly = useAuthStore(
    (s) => s.accessStatus?.locked_features ?? EMPTY_LOCKED_FEATURES
  );
  const accessStatusLoaded = accessStatusForChat !== null && accessStatusForChat !== undefined;
  const chatUnlocked =
    !user ||
    user.role !== 'eaglet' ||
    (accessStatusLoaded && !lockedFeaturesEarly.includes('messages'));
  const chatUnread = useTotalUnread({ enabled: tokenReady && chatUnlocked });
  const chatBadge = chatUnread > 0 ? chatUnread : undefined;


  // Real notification hooks — work for all roles, gated on tokenReady
  const { data: notificationsData } = useNotifications(undefined, { enabled: tokenReady });
  const { data: unreadData } = useUnreadCount({ enabled: tokenReady });
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Mount WS connection — gated on tokenReady so the cookie is fresh before connecting
  const { retryCount: wsRetryCount } = useNotificationSocket({ enabled: tokenReady });

  const notifications = notificationsData?.data?.results || notificationsData?.data || [];
  const unreadCount = unreadData?.data?.count ?? unreadData?.data?.unread_count ?? 0;

  const NOTIF_TYPE_META = {
    mentorship_request: { icon: 'person_add', bg: 'bg-blue-100 text-blue-600' },
    mentorship_approved: { icon: 'check_circle', bg: 'bg-emerald-100 text-emerald-600' },
    mentorship_rejected: { icon: 'cancel', bg: 'bg-red-100 text-red-600' },
    content_published: { icon: 'library_books', bg: 'bg-purple-100 text-purple-600' },
    points_awarded: { icon: 'stars', bg: 'bg-amber-100 text-amber-600' },
    badge_earned: { icon: 'military_tech', bg: 'bg-yellow-100 text-yellow-700' },
    nest_post: { icon: 'forum', bg: 'bg-cyan-100 text-cyan-600' },
    assignment_graded: { icon: 'grading', bg: 'bg-indigo-100 text-indigo-600' },
    post_like: { icon: 'favorite', bg: 'bg-red-100 text-red-500' },
    post_comment: { icon: 'chat_bubble', bg: 'bg-blue-100 text-blue-600' },
    general: { icon: 'notifications', bg: 'bg-slate-100 text-slate-600' },
  };

  const [bellShaking, setBellShaking] = useState(false);
  const prevUnreadRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      const t = setTimeout(() => {
        setBellShaking(true);
        setTimeout(() => setBellShaking(false), 600);
      }, 0);
      prevUnreadRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const handleNotifClick = (notif) => {
    if (!notif.is_read) {
      markAsReadMutation.mutate(notif.id);
    }
    // Resolver rewrites legacy action_urls (e.g. /points/badges → 404) and
    // derives a target by notification_type when action_url is empty.
    const target = resolveNotificationUrl(notif, user?.role);
    if (target) {
      navigate(target);
    }
    setShowNotifications(false);
  };

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsMobileMenuOpen(false);
  }

  // Fetch admin KYC badge count only
  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      if (user?.role !== 'admin') return;
      try {
        const response = await adminService.getStats();
        if (response.success && active) {
          setPendingKycCount(response.data.kyc?.total_pending || 0);
        }
      } catch {
        // Silently fail
      }
    };
    fetchStats();
    return () => { active = false; };
  }, [user?.role]);

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

  // Navigation items based on role + current mode (plan 18-03).
  // For stacked-admin users, mode drives which nav set renders so the
  // sidebar swaps entirely between mentor and admin views.
  const getNavItems = () => {
    const role = user?.role || 'eaglet';

    // Stacked admin (eagle OR eaglet + is_platform_staff — plan 22-02) —
    // `currentMode` decides which nav set to render. Pure admins
    // (role='admin') always see the admin nav.
    const isStackedAdmin =
      (role === 'eagle' || role === 'eaglet') && user?.is_platform_staff === true;
    const showAdminNav =
      role === 'admin' || (isStackedAdmin && currentMode === 'admin');

    if (showAdminNav) {
      // Three sidebar items now host paired sub-sections via SectionTabs:
      //   User Management  → All Users + KYC Reviews
      //   Admin Team       → Team + Admin Requests
      //   Store            → Catalog + Orders
      // Removed from sidebar: Orders, KYC Reviews (now reachable through their parent's tab strip).
      return [
        { to: '/', icon: 'home', label: 'Home' },
        { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/admin/users', icon: 'group', label: 'User Management', aliases: ['/admin/kyc'], badge: pendingKycCount > 0 ? pendingKycCount : undefined },
        { to: '/admin/team', icon: 'shield_person', label: 'Admin Team', aliases: ['/admin/team/requests'] },
        { to: '/admin/nests', icon: 'diversity_3', label: 'Nests' },
        { to: '/admin/store', icon: 'storefront', label: 'Store' },
        { to: '/admin/content', icon: 'library_books', label: 'Content' },
        { to: '/admin/donations', icon: 'volunteer_activism', label: 'Donations' },
        { to: '/settings', icon: 'settings', label: 'Settings' },
      ];
    }

    if (role === 'eagle') {
      return [
        { to: '/', icon: 'home', label: 'Home' },
        { to: '/eagle/dashboard', icon: 'dashboard', label: 'Dashboard' },
        // 'My Eaglets' moved into NestCommunityHubPage as a tab.
        // Standalone /eagle/eaglets route kept for deep links / back-compat.
        { to: '/eagle/nests', icon: 'diversity_3', label: 'My Nest' },
        { to: '/eagle/grading', icon: 'grading', label: 'Grading Center' },
        { to: '/eagle/content', icon: 'upload_file', label: 'Content' },
        { to: '/eagle/messages', icon: 'chat', label: 'Messages', badge: chatBadge },
        { to: '/eagle/resources', icon: 'library_books', label: 'Resources' },
        { to: '/settings', icon: 'settings', label: 'Settings' },
      ];
    }

    // Eaglet (mentee). My Requests dropped — moved into Nest page Requests tab (plan 14-05).
    // featureKey marks items gated by access_status.locked_features.
    return [
      { to: '/', icon: 'home', label: 'Home' },
      { to: '/eaglet/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { to: '/eaglet/nest', icon: 'nest_eco_leaf', label: 'Nest' },
      { to: '/eaglet/assignments', icon: 'assignment', label: 'Assignments', featureKey: 'assignments' },
      { to: '/eaglet/messages', icon: 'chat', label: 'Messages', badge: chatBadge, featureKey: 'messages' },
      { to: '/eaglet/leaderboard', icon: 'leaderboard', label: 'Leaderboard', featureKey: 'leaderboard' },
      { to: '/eaglet/resources', icon: 'library_books', label: 'Resources', featureKey: 'resources' },
      { to: '/settings', icon: 'settings', label: 'Settings' },
    ];
  };

  const navItems = getNavItems();

  // Plan 14-05: compute per-item lock state from access_status. Eagles + admins
  // never see locks. Clicking a locked item opens the modal instead of routing.
  const lockedFeatures = useLockedFeatures();
  const isEagletRole = user?.role === 'eaglet';
  const [lockModalKey, setLockModalKey] = useState(null);
  const closeLockModal = () => setLockModalKey(null);

  const roleDisplay = {
    admin: 'Administrator',
    eagle: 'Eagle (Mentor)',
    eaglet: 'Eaglet (Mentee)',
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  };

  return (
    <div className="h-screen flex overflow-hidden">
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
          fixed lg:static inset-y-0 left-0 h-full z-50
          bg-white/90 backdrop-blur-xl border-r border-slate-200/50
          flex flex-col transition-all duration-300 ease-out
          ${isSidebarOpen ? 'w-[85vw] sm:w-72 lg:w-72' : 'w-[85vw] sm:w-72 lg:w-[72px]'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Admin-mode accent stripe (plan 18-03) — passive cue that
            elevated privileges are active. Rendered as a natural-flow first
            child of the flex column so it doesn't need a relative ancestor
            (which would conflict with the `fixed lg:static` aside positioning). */}
        {currentMode === 'admin' && (
          <div
            aria-hidden
            className="w-full h-[2px] flex-shrink-0 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"
          />
        )}
        {/* Header with Logo and Collapse Toggle */}
        <div className={`h-16 flex items-center border-b border-slate-200/50 ${isSidebarOpen ? 'px-4 justify-between' : 'px-2 justify-center'}`}>
          <Link to="/" className={`flex items-center gap-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
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
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? '' : 'absolute -right-3.5 top-4 bg-white shadow-md border border-slate-200'}`}
          >
            <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`}>
              chevron_left
            </span>
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`border-b border-slate-200/50 ${isSidebarOpen ? 'px-4 py-4' : 'px-2 py-3'}`}>
          {isStackedAdmin ? (
            // Stacked admins get the role-switcher dropdown (plan 18-03).
            <RoleSwitcher
              user={user}
              onClose={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
              variant={isSidebarOpen ? 'expanded' : 'collapsed'}
            />
          ) : (
            // Single-role users see the existing static pill.
            <div className={`flex items-center rounded-xl transition-all duration-300 ${isSidebarOpen ? 'gap-3 p-3 bg-slate-50/80' : 'justify-center p-2'}`}>
              <div className="relative flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.first_name}
                    className="w-10 h-10 rounded-xl object-cover shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white items-center justify-center font-bold shadow-lg text-sm`}
                  style={{ display: user?.avatar ? 'none' : 'flex' }}>
                  {getInitials(user?.first_name, user?.last_name)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {roleDisplay[user?.role] || user?.role}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
          {navItems.map((item) => {
            const itemLocked =
              isEagletRole && item.featureKey && lockedFeatures.includes(item.featureKey);
            return (
              <NavItem
                key={item.to}
                {...item}
                isCollapsed={!isSidebarOpen}
                isActive={
                  location.pathname === item.to ||
                  (!item.exact && location.pathname.startsWith(item.to + '/')) ||
                  // SectionTabs consolidation: a sidebar item can keep its
                  // highlight when the user is on one of its sub-section
                  // routes that lives under a different path prefix.
                  (item.aliases || []).some((alias) =>
                    location.pathname === alias ||
                    location.pathname.startsWith(alias + '/'),
                  )
                }
                isLocked={itemLocked}
                onClick={() => {
                  if (itemLocked) {
                    setLockModalKey(item.featureKey);
                    return;
                  }
                  setIsMobileMenuOpen(false);
                }}
              />
            );
          })}
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden transition-all duration-300">
        {/* Top Header */}
        {!hideHeader && (
          <header className="flex-shrink-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100 transition-colors"
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
                  className="relative p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 transition-all duration-300 group"
                >
                  <span className={`material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors ${bellShaking ? 'animate-wiggle' : ''}`}>
                    notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                  <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsReadMutation.mutate()}
                          disabled={markAllAsReadMutation.isPending}
                          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length > 0 ? notifications.slice(0, 8).map((n) => {
                        const meta = NOTIF_TYPE_META[n.notification_type] || NOTIF_TYPE_META.general;
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/[0.03]' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                              <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs text-slate-900 ${!n.is_read ? 'font-bold' : 'font-semibold'}`}>{n.title}</p>
                              <p className="text-xs text-slate-500 truncate">{n.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatRelativeTime(n.created_at)}</span>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="px-4 py-8 text-center">
                          <span className="material-symbols-outlined text-2xl text-slate-300">notifications_off</span>
                          <p className="text-xs text-slate-400 mt-1">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-primary/5 border-t border-slate-100 transition-colors"
                      >
                        View all notifications
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Link
                to="/faq"
                aria-label="Frequently asked questions"
                title="FAQs"
                className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 transition-all duration-300 group hidden sm:flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">
                  help
                </span>
              </Link>

              {/* Logout button — visible on mobile where sidebar bottom is hidden */}
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-red-50 transition-all duration-300 group flex items-center justify-center"
                title="Log Out"
              >
                <span className="material-symbols-outlined text-slate-600 group-hover:text-red-500 transition-colors">
                  logout
                </span>
              </button>
            </div>
          </header>
        )}

        {/* WebSocket Reconnecting Banner — only shows after first drop (retryCount > 0) */}
        {wsRetryCount > 0 && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            Reconnecting to real-time updates… (attempt {wsRetryCount})
          </div>
        )}

        {/* Page Content — sole scroll container so sidebar/header stay fixed */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden ${noPadding ? '' : 'p-3 sm:p-4 lg:p-8'}`}>
          <div className={`${fullWidth ? 'max-w-none w-full' : 'max-w-7xl mx-auto'} animate-fade-in-up h-full min-w-0`}>
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
        @keyframes drift-grid {
          0%   { background-position: 0px 0px; }
          100% { background-position: 32px 32px; }
        }
        .animate-dot-grid { animation: drift-grid 12s linear infinite; }
      `}</style>

      {/* Plan 14-05: locked sidebar item modal */}
      {lockModalKey && (
        <LockedFeatureModal
          open={!!lockModalKey}
          featureKey={lockModalKey}
          onClose={closeLockModal}
        />
      )}
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['admin', 'eagle', 'eaglet', 'default']),
};

export default DashboardLayout;
