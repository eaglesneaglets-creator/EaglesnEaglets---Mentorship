import { describe, it, expect } from 'vitest';
import { buildAdminNav } from '../admin-nav';

const labels = (nav) => nav.map((i) => i.label);

describe('buildAdminNav', () => {
  it('hides Nests and Donations from scoped (non-super) admins', () => {
    const nav = buildAdminNav({ isSuperAdmin: false });
    expect(labels(nav)).not.toContain('Nests');
    expect(labels(nav)).not.toContain('Donations');
  });

  it('keeps shared admin surfaces for scoped admins', () => {
    const nav = buildAdminNav({ isSuperAdmin: false });
    expect(labels(nav)).toEqual(
      expect.arrayContaining([
        'Dashboard',
        'User Management',
        'Admin Team',
        'Store',
        'Content',
        'Messages',
        'Settings',
      ]),
    );
  });

  it('shows Messages to all admins (super + scoped)', () => {
    expect(labels(buildAdminNav({ isSuperAdmin: false }))).toContain('Messages');
    expect(labels(buildAdminNav({ isSuperAdmin: true }))).toContain('Messages');
  });

  it('passes the chat unread badge through to Messages', () => {
    const nav = buildAdminNav({ isSuperAdmin: false, chatBadge: 5 });
    const messages = nav.find((i) => i.label === 'Messages');
    expect(messages.badge).toBe(5);
  });

  it('shows Nests and Donations to superadmins', () => {
    const nav = buildAdminNav({ isSuperAdmin: true });
    expect(labels(nav)).toContain('Nests');
    expect(labels(nav)).toContain('Donations');
  });

  it('surfaces the KYC badge on User Management when pending', () => {
    const nav = buildAdminNav({ isSuperAdmin: false, pendingKycCount: 3 });
    const users = nav.find((i) => i.label === 'User Management');
    expect(users.badge).toBe(3);
  });

  it('omits the badge when no pending KYC', () => {
    const nav = buildAdminNav({ isSuperAdmin: true, pendingKycCount: 0 });
    const users = nav.find((i) => i.label === 'User Management');
    expect(users.badge).toBeUndefined();
  });
});
