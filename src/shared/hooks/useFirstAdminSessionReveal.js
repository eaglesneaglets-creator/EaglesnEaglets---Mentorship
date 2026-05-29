/**
 * useFirstAdminSessionReveal (plan 18-03).
 *
 * When the BE flips `user.admin_request.first_admin_session = true` on a
 * /auth/me/ response, the auth-store hydration already forces currentMode
 * to 'admin'. This hook fires a one-shot welcome toast on the same render
 * and clears the local guard so subsequent /auth/me/ fetches don't repeat
 * the toast within the same session.
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@store';
import { toast } from '@shared/components/ui/toast-utils';

export default function useFirstAdminSessionReveal() {
  const user = useAuthStore((s) => s.user);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!user?.admin_request?.first_admin_session) return;
    firedRef.current = true;
    toast.success(
      'Welcome to the admin team. Use the role switcher in the sidebar to jump back to mentor view anytime.',
      { duration: 6000 },
    );
  }, [user?.admin_request?.first_admin_session]);
}
