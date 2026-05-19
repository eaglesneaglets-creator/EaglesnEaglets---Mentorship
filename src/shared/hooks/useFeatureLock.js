/**
 * useFeatureLock — single source of truth for mentee feature gating (plan 14-05).
 *
 * Reads `accessStatus.locked_features` from auth-store and decides whether the
 * given featureKey is locked for the current user. Eagles + admins bypass.
 */

import { useCallback, useState } from 'react';
import { useAuthStore, useLockedFeatures } from '@store/auth-store';

// Plan 14.5-02: leaderboard joins the gated set so all four mentee feature
// surfaces lock until the user has an active program enrollment.
const GATED_KEYS = new Set(['assignments', 'messages', 'resources', 'leaderboard']);

export function useFeatureLock(featureKey) {
  const role = useAuthStore((s) => s.user?.role ?? null);
  const accessStatus = useAuthStore((s) => s.accessStatus);
  const lockedFeatures = useLockedFeatures();
  const [modalOpen, setModalOpen] = useState(false);

  // Default-deny for eaglets while accessStatus is still loading.
  // Without this, a direct-nav refresh briefly renders the unlocked page
  // (and fires 403-prone API calls) before /auth/me/ resolves.
  const isEagletGatedKey = role === 'eaglet' && GATED_KEYS.has(featureKey);
  const accessStatusLoaded = accessStatus !== null && accessStatus !== undefined;
  const isLocked =
    isEagletGatedKey && (
      !accessStatusLoaded || lockedFeatures.includes(featureKey)
    );

  const openLockModal = useCallback(() => setModalOpen(true), []);
  const closeLockModal = useCallback(() => setModalOpen(false), []);

  return { isLocked, modalOpen, openLockModal, closeLockModal };
}
