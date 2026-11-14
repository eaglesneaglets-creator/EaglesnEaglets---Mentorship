import { buildAdminNav } from './admin-nav';

/**
 * App navigation — one source of truth for the sidebar, the mobile tab bar
 * and the ⌘K command menu.
 *
 * Items: { to, icon, label, badge?, featureKey?, aliases?, exact?, tour? }
 *   featureKey — gated by access_status.locked_features (mentees only)
 *   tour       — stable id for the guided tour (data-tour="nav-<tour>")
 *
 * "Home" ('/') is the public website, not part of the app nav: it lives in
 * the account menu ("Visit website"). Having both Home and Dashboard in the
 * sidebar confused users (critique, Nov 2026). Settings sits in the footer.
 */

const EAGLET_GROUPS = (chatBadge) => [
  {
    label: null,
    items: [{ to: '/eaglet/dashboard', icon: 'dashboard', label: 'Dashboard', tour: 'dashboard' }],
  },
  {
    label: 'Learn',
    items: [
      { to: '/eaglet/assignments', icon: 'assignment', label: 'Assignments', featureKey: 'assignments', tour: 'assignments' },
      { to: '/eaglet/resources', icon: 'library_books', label: 'Resources', featureKey: 'resources', tour: 'resources' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/eaglet/nest', icon: 'nest_eco_leaf', label: 'My Nest', tour: 'nest' },
      { to: '/eaglet/messages', icon: 'chat', label: 'Messages', badge: chatBadge, featureKey: 'messages', tour: 'messages' },
      { to: '/eaglet/leaderboard', icon: 'leaderboard', label: 'Leaderboard', featureKey: 'leaderboard', tour: 'leaderboard' },
    ],
  },
];

const EAGLE_GROUPS = (chatBadge) => [
  {
    label: null,
    items: [{ to: '/eagle/dashboard', icon: 'dashboard', label: 'Dashboard', tour: 'dashboard' }],
  },
  {
    label: 'Mentoring',
    items: [
      { to: '/eagle/nests', icon: 'diversity_3', label: 'My Nest', tour: 'nest' },
      { to: '/eagle/grading', icon: 'grading', label: 'Grading', tour: 'grading' },
      { to: '/eagle/content', icon: 'upload_file', label: 'Content', tour: 'content' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/eagle/messages', icon: 'chat', label: 'Messages', badge: chatBadge, tour: 'messages' },
      { to: '/eagle/resources', icon: 'library_books', label: 'Resources', tour: 'resources' },
    ],
  },
];

// Admin items come from buildAdminNav (privilege tiers live there); this only
// assigns them to sections.
const ADMIN_SECTION = {
  '/admin/dashboard': null,
  '/admin/users': 'People',
  '/admin/team': 'People',
  '/admin/nests': 'People',
  '/admin/content': 'Platform',
  '/admin/store': 'Platform',
  '/admin/donations': 'Platform',
  '/admin/messages': 'Inbox',
};
const ADMIN_SECTION_ORDER = [null, 'People', 'Platform', 'Inbox'];

function adminGroups({ isSuperAdmin, pendingKycCount, chatBadge }) {
  const items = buildAdminNav({ isSuperAdmin, pendingKycCount, chatBadge })
    .filter((item) => item.to !== '/' && item.to !== '/settings')
    .map((item) => ({ ...item, tour: item.to.split('/').pop() }));
  return ADMIN_SECTION_ORDER.map((label) => ({
    label,
    // `in`, not `??`: null is a real value here (the un-labelled top group).
    items: items.filter((item) => (item.to in ADMIN_SECTION ? ADMIN_SECTION[item.to] : 'Platform') === label),
  })).filter((group) => group.items.length);
}

/**
 * @returns {Array<{label: string|null, items: Array}>}
 */
export function getNavGroups({ role, showAdminNav, isSuperAdmin, pendingKycCount = 0, chatBadge }) {
  if (showAdminNav) return adminGroups({ isSuperAdmin, pendingKycCount, chatBadge });
  if (role === 'eagle') return EAGLE_GROUPS(chatBadge);
  return EAGLET_GROUPS(chatBadge);
}

export const flattenNav = (groups) => groups.flatMap((group) => group.items);

/** Mobile tab bar: four stable destinations per role, plus "More". */
export const MOBILE_TABS = {
  admin: ['/admin/dashboard', '/admin/users', '/admin/content', '/admin/messages'],
  eagle: ['/eagle/dashboard', '/eagle/nests', '/eagle/grading', '/eagle/messages'],
  eaglet: ['/eaglet/dashboard', '/eaglet/nest', '/eaglet/assignments', '/eaglet/messages'],
};

export const SETTINGS_ITEM = { to: '/settings', icon: 'settings', label: 'Settings', tour: 'settings' };

export function isNavItemActive(item, pathname) {
  return (
    pathname === item.to ||
    (!item.exact && pathname.startsWith(`${item.to}/`)) ||
    (item.aliases || []).some((alias) => pathname === alias || pathname.startsWith(`${alias}/`))
  );
}
