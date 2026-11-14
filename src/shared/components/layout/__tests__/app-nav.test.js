import { describe, it, expect } from 'vitest';
import { flattenNav, getNavGroups, isNavItemActive, MOBILE_TABS } from '../app-nav';

describe('app nav', () => {
  it('puts Dashboard first, un-labelled, for every view', () => {
    for (const args of [
      { role: 'eaglet', showAdminNav: false },
      { role: 'eagle', showAdminNav: false },
      { role: 'admin', showAdminNav: true, isSuperAdmin: true },
      { role: 'admin', showAdminNav: true, isSuperAdmin: false },
    ]) {
      const [first] = getNavGroups(args);
      expect(first.label).toBeNull();
      expect(first.items[0].label).toBe('Dashboard');
    }
  });

  it('keeps the public site and settings out of the section nav', () => {
    const paths = flattenNav(getNavGroups({ role: 'admin', showAdminNav: true, isSuperAdmin: true })).map((i) => i.to);
    expect(paths).not.toContain('/');
    expect(paths).not.toContain('/settings');
  });

  it('hides superadmin surfaces from scoped admins', () => {
    const scoped = flattenNav(getNavGroups({ role: 'admin', showAdminNav: true, isSuperAdmin: false })).map((i) => i.to);
    expect(scoped).not.toContain('/admin/nests');
    expect(scoped).not.toContain('/admin/donations');
  });

  it('every mobile tab exists in its nav set', () => {
    const sets = {
      eaglet: getNavGroups({ role: 'eaglet', showAdminNav: false }),
      eagle: getNavGroups({ role: 'eagle', showAdminNav: false }),
      admin: getNavGroups({ role: 'admin', showAdminNav: true, isSuperAdmin: true }),
    };
    for (const [view, tabs] of Object.entries(MOBILE_TABS)) {
      const paths = flattenNav(sets[view]).map((i) => i.to);
      tabs.forEach((t) => expect(paths).toContain(t));
    }
  });

  it('matches sub-routes and aliases as active', () => {
    const users = { to: '/admin/users', aliases: ['/admin/kyc'] };
    expect(isNavItemActive(users, '/admin/users')).toBe(true);
    expect(isNavItemActive(users, '/admin/kyc/123')).toBe(true);
    expect(isNavItemActive(users, '/admin/user')).toBe(false);
  });
});
