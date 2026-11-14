import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@api';
import { useAuthStore } from '@store';
import { AUTO_START_PATHS, getTour } from './tour-definitions';

const localKey = (userId, tourId) => `ee_tour_${tourId}_${userId}`;

function seenLocally(userId, tourId) {
  try {
    return localStorage.getItem(localKey(userId, tourId)) === '1';
  } catch {
    return true; // storage unavailable: never block the app on the tour
  }
}

function rememberLocally(userId, tourId) {
  try {
    localStorage.setItem(localKey(userId, tourId), '1');
  } catch {
    /* ignore */
  }
}

/**
 * useProductTour — which tour applies, whether it should start by itself,
 * and how completion is recorded.
 *
 * Completion is stored on the server (user.completed_tours via
 * POST /auth/me/tours/) so the tour doesn't reappear on every new device,
 * and in localStorage so it stays dismissed even if that request fails.
 */
export default function useProductTour({ view, hasActiveProgram, isSuperAdmin, pathname, ready }) {
  const user = useAuthStore((s) => s.user);
  const tour = useMemo(
    () => getTour({ view, hasActiveProgram, isSuperAdmin }),
    [view, hasActiveProgram, isSuperAdmin],
  );
  const [open, setOpen] = useState(false);

  const completed = Boolean(
    user?.id && (user.completed_tours?.includes(tour.id) || seenLocally(user.id, tour.id)),
  );

  // Auto-start once, only on the role's own dashboard (never mid-task).
  useEffect(() => {
    if (!ready || !user?.id || completed || !AUTO_START_PATHS.includes(pathname)) return undefined;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [ready, user?.id, completed, pathname]);

  const finish = useCallback(() => {
    setOpen(false);
    if (!user?.id) return;
    rememberLocally(user.id, tour.id);
    if (user.completed_tours?.includes(tour.id)) return;
    apiClient
      .post('/auth/me/tours/', { tour: tour.id })
      .then((res) => {
        const tours = res?.data?.completed_tours || res?.completed_tours;
        if (Array.isArray(tours)) {
          useAuthStore.setState((s) => (s.user ? { user: { ...s.user, completed_tours: tours } } : {}));
        }
      })
      .catch(() => { /* localStorage already remembers it */ });
  }, [user, tour.id]);

  const start = useCallback(() => setOpen(true), []);

  return { tour, open, start, finish };
}
