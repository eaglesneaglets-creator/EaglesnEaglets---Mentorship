/**
 * Tour persistence — localStorage helpers, kept in a plain module (not the
 * component file) so fast-refresh stays happy and the storage key lives in one
 * place. Swap these two functions for a backend flag if you ever want the
 * "seen" state to follow a user across devices.
 */

const storageKey = (userId) => `ee_tour_seen_${userId ?? 'anon'}`;

export const hasSeenTour = (userId) => {
  try {
    return localStorage.getItem(storageKey(userId)) === '1';
  } catch {
    // localStorage can throw in private mode / disabled storage — fail closed
    // (treat as "seen") so we never block the app on a non-critical tour.
    return true;
  }
};

export const markTourSeen = (userId) => {
  try {
    localStorage.setItem(storageKey(userId), '1');
  } catch {
    /* no-op: storage unavailable */
  }
};
