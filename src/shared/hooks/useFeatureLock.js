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

  const isEagletGatedKey = role === 'eaglet' && GATED_KEYS.has(featureKey);
  const accessStatusLoaded = accessStatus !== null && accessStatus !== undefined;

  // Tri-state contract (fixes the "join-a-nest modal flash" bug):
  //   isChecking — eaglet on a gated key, but /auth/me/ hasn't resolved yet.
  //                Callers MUST render a neutral loader (NOT the lock modal),
  //                otherwise users with access see the modal flash before it
  //                disappears. Children must NOT render during isChecking either
  //                — that re-introduces the 403-prone unlocked-render race.
  //   isLocked   — eaglet on a gated key, access loaded, feature in locked list.
  //                Callers render the lock UI.
  //   neither    — feature is accessible (eagle/admin OR eaglet with the feature
  //                unlocked). Callers render children.
  const isChecking = isEagletGatedKey && !accessStatusLoaded;
  const isLocked =
    isEagletGatedKey && accessStatusLoaded && lockedFeatures.includes(featureKey);

  const openLockModal = useCallback(() => setModalOpen(true), []);
  const closeLockModal = useCallback(() => setModalOpen(false), []);

  return { isLocked, isChecking, modalOpen, openLockModal, closeLockModal };
}
