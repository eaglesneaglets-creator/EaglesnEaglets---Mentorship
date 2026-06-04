import { describe, it, expect, beforeEach } from 'vitest';
import { resolveCurrentMode } from '../auth-store';

describe('resolveCurrentMode', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem('ee_role_mode');
    } catch {
      /* ignore */
    }
  });

  it('returns null for no user', () => {
    expect(resolveCurrentMode(null)).toBe(null);
  });

  it('forces admin for pure admin user', () => {
    expect(resolveCurrentMode({ role: 'admin' })).toBe('admin');
    expect(resolveCurrentMode({ role: 'eaglet', is_superuser: true })).toBe('admin');
  });

  it('returns mentor for pure mentor (no platform staff)', () => {
    expect(resolveCurrentMode({ role: 'eagle' })).toBe('mentor');
    expect(resolveCurrentMode({ role: 'eagle', is_platform_staff: false })).toBe('mentor');
  });

  it('returns mentee for pure mentee (plan 22-02)', () => {
    expect(resolveCurrentMode({ role: 'eaglet' })).toBe('mentee');
    expect(resolveCurrentMode({ role: 'eaglet', is_platform_staff: false })).toBe('mentee');
  });

  it('defaults stacked-mentee to mentee when no localStorage value', () => {
    expect(
      resolveCurrentMode({ role: 'eaglet', is_platform_staff: true }),
    ).toBe('mentee');
  });

  it('honors localStorage admin for stacked-mentee', () => {
    localStorage.setItem('ee_role_mode', 'admin');
    expect(
      resolveCurrentMode({ role: 'eaglet', is_platform_staff: true }),
    ).toBe('admin');
  });

  it('rejects mismatched stored mode (mentor stored for stacked-mentee)', () => {
    localStorage.setItem('ee_role_mode', 'mentor');
    expect(
      resolveCurrentMode({ role: 'eaglet', is_platform_staff: true }),
    ).toBe('mentee');
  });

  it('forces admin on first_admin_session flag, ignoring localStorage', () => {
    localStorage.setItem('ee_role_mode', 'mentor');
    const result = resolveCurrentMode({
      role: 'eagle',
      is_platform_staff: true,
      admin_request: { first_admin_session: true },
    });
    expect(result).toBe('admin');
  });

  it('honors localStorage value for stacked admin', () => {
    localStorage.setItem('ee_role_mode', 'admin');
    expect(
      resolveCurrentMode({ role: 'eagle', is_platform_staff: true }),
    ).toBe('admin');
  });

  it('defaults stacked admin to mentor when no localStorage value', () => {
    expect(
      resolveCurrentMode({ role: 'eagle', is_platform_staff: true }),
    ).toBe('mentor');
  });
});
