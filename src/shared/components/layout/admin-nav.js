/**
 * buildAdminNav — the admin sidebar items, tiered by privilege.
 *
 * Superadmin-only surfaces (Nests platform management, Donations) are omitted
 * for scoped (dual-role) admins. This is UX only — the backend independently
 * 403s these endpoints — so hiding them just avoids dead links.
 *
 * Pure function (no store/router deps) so it is trivially unit-testable.
 *
 * @param {object}  opts
 * @param {boolean} opts.isSuperAdmin   — user.is_superuser
 * @param {number}  [opts.pendingKycCount] — badge count for User Management
 * @returns {Array<{to:string, icon:string, label:string, aliases?:string[], badge?:number}>}
 */
export function buildAdminNav({ isSuperAdmin, pendingKycCount = 0 } = {}) {
  const nav = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    {
      to: '/admin/users',
      icon: 'group',
      label: 'User Management',
      aliases: ['/admin/kyc'],
      badge: pendingKycCount > 0 ? pendingKycCount : undefined,
    },
    { to: '/admin/team', icon: 'shield_person', label: 'Admin Team', aliases: ['/admin/team/requests'] },
    { to: '/admin/store', icon: 'storefront', label: 'Store' },
    { to: '/admin/content', icon: 'library_books', label: 'Content' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ];

  // Superadmin-only surfaces inserted in their canonical positions.
  if (isSuperAdmin) {
    // Nests after Admin Team (index 4), Donations after Content.
    nav.splice(4, 0, { to: '/admin/nests', icon: 'diversity_3', label: 'Nests' });
    const contentIdx = nav.findIndex((i) => i.to === '/admin/content');
    nav.splice(contentIdx + 1, 0, {
      to: '/admin/donations',
      icon: 'volunteer_activism',
      label: 'Donations',
    });
  }

  return nav;
}

export default buildAdminNav;
