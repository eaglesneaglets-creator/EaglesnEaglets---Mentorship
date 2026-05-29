/**
 * useUrlModeSync (plan 18-03) — auto-flip role mode based on the URL.
 *
 * When a stacked-admin user navigates to an `/admin/*` route while in mentor
 * mode, silently flip them to admin mode (and vice versa). This lets deep
 * links work seamlessly: paste an admin URL while in mentor mode → land in
 * admin mode + see admin sidebar items, no error or jarring prompt.
 *
 * For single-role users this is a no-op — they don't have a switcher and
 * their existing role-guards handle access.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsStackedAdmin, useCurrentMode, useSetCurrentMode } from '@store';

const ADMIN_PREFIX = '/admin';

export default function useUrlModeSync() {
  const { pathname } = useLocation();
  const isStacked = useIsStackedAdmin();
  const currentMode = useCurrentMode();
  const setCurrentMode = useSetCurrentMode();

  useEffect(() => {
    if (!isStacked) return;
    const inAdminRoute =
      pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
    if (inAdminRoute && currentMode !== 'admin') {
      setCurrentMode('admin');
    } else if (!inAdminRoute && currentMode === 'admin') {
      // Only flip back when we land on a route that's clearly mentor-side
      // (e.g. /dashboard, /eagle/*, /settings/*). Public routes like
      // /admin-role/accept/:token are NOT under /admin/ so they don't trigger.
      setCurrentMode('mentor');
    }
  }, [pathname, isStacked, currentMode, setCurrentMode]);
}
