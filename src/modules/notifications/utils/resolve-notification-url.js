/**
 * Resolve where a notification click should navigate.
 *
 * Two jobs:
 *  1. LEGACY REWRITES — older notifications in the DB carry action_urls that
 *     never matched real FE routes (e.g. /points/badges → the badge-click 404).
 *     The backend now writes correct URLs, but historical rows persist.
 *  2. TYPE FALLBACKS — when action_url is empty, derive a sensible target
 *     from notification_type so every notification is clickable.
 *
 * Returns a route string, or null when there is genuinely nowhere to go
 * (e.g. a 'general' announcement) — caller should then just mark-as-read.
 */

const roleLeaderboard = (role) =>
  role === 'eagle' ? '/eagle/leaderboard' : '/eaglet/leaderboard';

const roleMessages = (role) =>
  role === 'eagle' ? '/eagle/messages' : '/eaglet/messages';

const roleNest = (role, nestId) =>
  role === 'eagle' ? `/eagle/nests/${nestId}` : `/eaglet/nest/${nestId}`;

/** Known-broken legacy action_urls → working routes. Order matters. */
const LEGACY_REWRITES = [
  { match: /^\/points\/badges\/?$/, to: () => '/eaglet/badges' },
  { match: /^\/points\/?$/, to: (m, role) => roleLeaderboard(role) },
  { match: /^\/nests\/browse\/?$/, to: () => '/eaglet/nest' },
  { match: /^\/nest\/([^/]+)\/settings\/?$/, to: (m) => `/eagle/nests/${m[1]}/requests` },
  { match: /^\/nest\/([^/]+)\/?$/, to: (m, role) => roleNest(role, m[1]) },
  // Old singular eagle nest path → plural route.
  { match: /^\/eagle\/nest\/([^/]+)\/?$/, to: (m) => `/eagle/nests/${m[1]}` },
];

/** Fallback target per notification_type when action_url is empty. */
const TYPE_FALLBACKS = {
  badge_earned: () => '/eaglet/badges',
  points_awarded: (role) => roleLeaderboard(role),
  chat_message: (role) => roleMessages(role),
  assignment_graded: () => '/eaglet/assignments',
  content_published: (role) =>
    role === 'eagle' ? '/eagle/content' : '/eaglet/assignments',
  mentorship_request: () => '/eagle/nests',
  mentorship_approved: () => '/eaglet/nest',
  mentorship_rejected: () => '/eaglet/nest',
  order_confirmed: () => '/store/orders',
  payment_received: () => '/store/orders',
  general: () => null,
};

export function resolveNotificationUrl(notification, role) {
  const url = (notification?.action_url || '').trim();

  if (url) {
    for (const { match, to } of LEGACY_REWRITES) {
      const m = url.match(match);
      if (m) return to(m, role);
    }
    return url; // already a valid route (BE now writes correct ones)
  }

  const fallback = TYPE_FALLBACKS[notification?.notification_type];
  return fallback ? fallback(role) : null;
}
