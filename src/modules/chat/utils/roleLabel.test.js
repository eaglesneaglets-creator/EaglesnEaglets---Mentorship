import { describe, it, expect } from 'vitest';
import { chatRoleLabel } from './roleLabel';

describe('chatRoleLabel', () => {
  it('labels a pure admin as Admin', () => {
    expect(chatRoleLabel({ role: 'admin' })).toBe('Admin');
  });

  it('labels a superuser as Admin', () => {
    expect(chatRoleLabel({ role: 'eagle', is_superuser: true })).toBe('Admin');
  });

  it('labels a stacked mentor-admin (role eagle + platform staff) as Admin', () => {
    expect(chatRoleLabel({ role: 'eagle', is_platform_staff: true })).toBe('Admin');
  });

  it('labels a plain mentor as Mentor', () => {
    expect(chatRoleLabel({ role: 'eagle' })).toBe('Mentor');
  });

  it('labels a mentee as Mentee', () => {
    expect(chatRoleLabel({ role: 'eaglet' })).toBe('Mentee');
  });

  it('returns empty string for no user', () => {
    expect(chatRoleLabel(null)).toBe('');
  });
});
