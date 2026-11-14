import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuthStore, useLockedFeatures, useCurrentMode, useIsStackedAdmin, useHasActiveProgram } from '@store';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LockedFeatureModal } from '@shared/components/feature-lock/LockedFeatureModal';
import { refreshAccessToken } from '../../../api';
import { adminService } from '../../../modules/auth/services/auth-service';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationSocket,
} from '../../../modules/notifications/hooks/useNotifications';
import { resolveNotificationUrl } from '../../../modules/notifications/utils/resolve-notification-url';
import { useTotalUnread } from '../../../modules/chat/hooks/useChat';
import ProductTour from '../onboarding/ProductTour';
import useProductTour from '../onboarding/useProductTour';
import AppSidebar from './AppSidebar';
import CommandMenu, { CommandMenuTrigger } from './CommandMenu';
import MobileTabBar from './MobileTabBar';
import NotificationsMenu from './NotificationsMenu';
import RoleSwitcher from './RoleSwitcher';
import UserMenu from './UserMenu';
import { MOBILE_TABS, flattenNav, getNavGroups } from './app-nav';

const EMPTY_LOCKED_FEATURES = [];
const SIDEBAR_KEY = 'ee_sidebar_open';

const readSidebarOpen = () => {
  try {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
};

/**
 * DashboardLayout — the authenticated app shell (shadcn Sidebar).
 *
 * - Sidebar: grouped, role-aware nav; collapses to an icon rail (⌘/Ctrl+B or
 *   the rail); becomes a sheet below lg. Collapse state persists.
 * - Header: sidebar toggle, ⌘K command menu, notifications, help.
 * - Mobile: bottom tab bar with four destinations plus "More".
 * - Guided tour: starts once on the role dashboard; replay from the account
 *   menu or ⌘K.
 * - Skip link to the page content for keyboard and screen-reader users.
 */
const DashboardLayout = ({
  children,
  variant = 'default',
  fullWidth = false,
  noPadding = false,
  hideHeader = false,
  fullHeight = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const currentMode = useCurrentMode();
  const isStackedAdmin = useIsStackedAdmin();
  const hasActiveProgram = useHasActiveProgram();

  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen);
  const onSidebarOpenChange = (next) => {
    setSidebarOpen(next);
    try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* ignore */ }
  };

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [lockModalKey, setLockModalKey] = useState(null);

  // Rehydrate the access token on refresh (httpOnly refresh cookie). Must run
  // before authenticated React Query hooks fire.
  const { accessToken, setAccessToken } = useAuthStore();
  const [tokenReady, setTokenReady] = useState(!!accessToken);
  useEffect(() => {
    if (accessToken) {
      setTokenReady(true);
      return;
    }
    refreshAccessToken()
      .then((token) => { if (token) setAccessToken(token); })
      .catch(() => { /* session expired — AuthGuard redirects */ })
      .finally(() => setTokenReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep access_status (locks, enrolment) fresh on mount and window focus.
  const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);
  useEffect(() => {
    if (!tokenReady || !refreshAccessStatus) return undefined;
    refreshAccessStatus();
    const onFocus = () => refreshAccessStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [tokenReady, refreshAccessStatus]);

  // Chat unread badge — only when chat is unlocked (locked mentees get 403s).
  const accessStatus = useAuthStore((s) => s.accessStatus);
  const lockedFeatures = useLockedFeatures() || EMPTY_LOCKED_FEATURES;
  const accessStatusLoaded = accessStatus !== null && accessStatus !== undefined;
  const chatUnlocked =
    !user || user.role !== 'eaglet' || (accessStatusLoaded && !lockedFeatures.includes('messages'));
  const chatUnread = useTotalUnread({ enabled: tokenReady && chatUnlocked });
  const chatBadge = chatUnread > 0 ? chatUnread : undefined;

  // Notifications (all roles) + live socket.
  const { data: notificationsData } = useNotifications(undefined, { enabled: tokenReady });
  const { data: unreadData } = useUnreadCount({ enabled: tokenReady });
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const { retryCount: wsRetryCount } = useNotificationSocket({ enabled: tokenReady });
  const notifications = notificationsData?.data?.results || notificationsData?.data || [];
  const unreadCount = unreadData?.data?.count ?? unreadData?.data?.unread_count ?? 0;

  // Nudge the bell when a new notification arrives.
  const [bellShaking, setBellShaking] = useState(false);
  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setBellShaking(true);
      const t = setTimeout(() => setBellShaking(false), 600);
      prevUnreadRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
    return undefined;
  }, [unreadCount]);

  const handleNotificationSelect = (notification) => {
    if (!notification.is_read) markAsReadMutation.mutate(notification.id);
    const target = resolveNotificationUrl(notification, user?.role);
    setNotificationsOpen(false);
    if (target) navigate(target);
  };

  // Admin: pending KYC count for the People badge.
  useEffect(() => {
    if (user?.role !== 'admin') return undefined;
    let active = true;
    adminService.getStats()
      .then((response) => {
        if (response.success && active) setPendingKycCount(response.data.kyc?.total_pending || 0);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Nav set: pure admins always get admin nav; dual-role users by mode.
  const navRole = user?.role || 'eaglet';
  const isStackedAdminUser = (navRole === 'eagle' || navRole === 'eaglet') && user?.is_platform_staff === true;
  const showAdminNav = navRole === 'admin' || (isStackedAdminUser && currentMode === 'admin');
  const view = showAdminNav ? 'admin' : navRole === 'eagle' ? 'eagle' : 'eaglet';
  const isMentee = user?.role === 'eaglet';

  const groups = getNavGroups({
    role: navRole,
    showAdminNav,
    isSuperAdmin: Boolean(user?.is_superuser),
    pendingKycCount,
    chatBadge,
  });
  const flatNav = flattenNav(groups);
  const mobileItems = (MOBILE_TABS[view] || MOBILE_TABS.eaglet)
    .map((path) => flatNav.find((item) => item.to === path))
    .filter(Boolean);

  const { tour, open: tourOpen, start: startTour, finish: finishTour } = useProductTour({
    view,
    hasActiveProgram,
    isSuperAdmin: Boolean(user?.is_superuser),
    pathname: location.pathname,
    ready: tokenReady && Boolean(user),
  });

  const userMenu = isStackedAdmin ? (
    <RoleSwitcher user={user} onLogout={handleLogout} onStartTour={startTour} side="right" align="end" />
  ) : (
    <UserMenu
      user={user}
      onNavigate={(path) => navigate(path)}
      onStartTour={startTour}
      onLogout={handleLogout}
      side="right"
      align="end"
    />
  );

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        className="ios-app-shell h-svh overflow-hidden"
        data-variant={variant}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>

        <AppSidebar
          groups={groups}
          lockedFeatures={lockedFeatures}
          isMentee={isMentee}
          adminView={showAdminNav}
          userMenu={userMenu}
          onLockedClick={setLockModalKey}
        />

        <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden bg-background">
          {!hideHeader && (
            <header className="ios-app-header z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4 lg:px-6">
              <SidebarTrigger className="-ml-1 size-9" aria-label="Toggle navigation" />
              <Separator orientation="vertical" className="mr-1 hidden h-5 lg:block" />
              <CommandMenuTrigger onOpen={() => setCommandOpen(true)} className="max-sm:max-w-none" />
              <div className="ml-auto flex items-center gap-1">
                <NotificationsMenu
                  open={notificationsOpen}
                  onOpenChange={setNotificationsOpen}
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onSelect={handleNotificationSelect}
                  onMarkAllRead={() => markAllAsReadMutation.mutate()}
                  markingAll={markAllAsReadMutation.isPending}
                  shaking={bellShaking}
                />
              </div>
            </header>
          )}

          {wsRetryCount > 0 && (
            <div role="status" className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900">
              <span className="size-2 shrink-0 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
              Reconnecting to live updates… (attempt {wsRetryCount})
            </div>
          )}

          <div
            id="main-content"
            tabIndex={-1}
            className={`ios-page-content flex-1 overflow-x-hidden overflow-y-auto outline-none ${noPadding ? '' : 'p-4 sm:p-6 lg:p-8'}`}
          >
            <div className={`${fullWidth ? 'w-full max-w-none' : 'mx-auto max-w-7xl'} ${fullHeight ? 'ios-page-fill' : 'ios-page-flow'} h-full min-w-0`}>
              {children}
            </div>
          </div>
        </SidebarInset>

        <MobileTabBar
          items={mobileItems}
          lockedFeatures={lockedFeatures}
          isMentee={isMentee}
          onLockedClick={setLockModalKey}
        />

        <CommandMenu
          open={commandOpen}
          onOpenChange={setCommandOpen}
          groups={groups}
          lockedFeatures={lockedFeatures}
          isMentee={isMentee}
          onNavigate={(path) => navigate(path)}
          onStartTour={startTour}
          onLogout={handleLogout}
        />

        {tourOpen && <ProductTour key={tour.id} tour={tour} open onFinish={finishTour} />}

        {lockModalKey && (
          <LockedFeatureModal open featureKey={lockModalKey} onClose={() => setLockModalKey(null)} />
        )}
      </SidebarProvider>
    </TooltipProvider>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  /** Kept for API compatibility; exposed as data-variant on the shell. */
  variant: PropTypes.oneOf(['admin', 'eagle', 'eaglet', 'default']),
  fullWidth: PropTypes.bool,
  noPadding: PropTypes.bool,
  hideHeader: PropTypes.bool,
  // Page owns its own internal scroll regions (chat, content viewer) and
  // needs a definite height on mobile instead of growing with content.
  fullHeight: PropTypes.bool,
};

export default DashboardLayout;
