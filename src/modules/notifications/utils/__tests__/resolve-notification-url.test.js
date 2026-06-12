import { describe, it, expect } from 'vitest';
import { resolveNotificationUrl } from '../resolve-notification-url';

const notif = (overrides) => ({
  notification_type: 'general',
  action_url: '',
  ...overrides,
});

describe('resolveNotificationUrl — legacy rewrites', () => {
  it('rewrites the broken badge URL (the reported 404)', () => {
    expect(
      resolveNotificationUrl(
        notif({ notification_type: 'badge_earned', action_url: '/points/badges' }),
        'eaglet',
      ),
    ).toBe('/eaglet/badges');
  });

  it('rewrites /points to the role leaderboard', () => {
    expect(resolveNotificationUrl(notif({ action_url: '/points' }), 'eaglet')).toBe('/eaglet/leaderboard');
    expect(resolveNotificationUrl(notif({ action_url: '/points' }), 'eagle')).toBe('/eagle/leaderboard');
  });

  it('rewrites legacy nest settings URL to the requests queue', () => {
    expect(
      resolveNotificationUrl(notif({ action_url: '/nest/abc-123/settings' }), 'eagle'),
    ).toBe('/eagle/nests/abc-123/requests');
  });

  it('rewrites bare legacy nest URL per role', () => {
    expect(resolveNotificationUrl(notif({ action_url: '/nest/abc' }), 'eaglet')).toBe('/eaglet/nest/abc');
    expect(resolveNotificationUrl(notif({ action_url: '/nest/abc' }), 'eagle')).toBe('/eagle/nests/abc');
  });

  it('rewrites singular eagle nest path to plural route', () => {
    expect(resolveNotificationUrl(notif({ action_url: '/eagle/nest/xyz' }), 'eagle')).toBe('/eagle/nests/xyz');
  });

  it('rewrites /nests/browse to the discover tab', () => {
    expect(resolveNotificationUrl(notif({ action_url: '/nests/browse' }), 'eaglet')).toBe('/eaglet/nest');
  });
});

describe('resolveNotificationUrl — valid URLs pass through', () => {
  it('keeps already-correct URLs untouched', () => {
    expect(
      resolveNotificationUrl(notif({ action_url: '/eaglet/badges' }), 'eaglet'),
    ).toBe('/eaglet/badges');
    expect(
      resolveNotificationUrl(notif({ action_url: '/eagle/nests/n1/requests' }), 'eagle'),
    ).toBe('/eagle/nests/n1/requests');
  });
});

describe('resolveNotificationUrl — type fallbacks (empty action_url)', () => {
  it.each([
    ['badge_earned', 'eaglet', '/eaglet/badges'],
    ['points_awarded', 'eagle', '/eagle/leaderboard'],
    ['chat_message', 'eaglet', '/eaglet/messages'],
    ['chat_message', 'eagle', '/eagle/messages'],
    ['assignment_graded', 'eaglet', '/eaglet/assignments'],
    ['content_published', 'eaglet', '/eaglet/assignments'],
    ['content_published', 'eagle', '/eagle/content'],
    ['order_confirmed', 'eaglet', '/store/orders'],
  ])('%s (%s) → %s', (type, role, expected) => {
    expect(resolveNotificationUrl(notif({ notification_type: type }), role)).toBe(expected);
  });

  it('general announcements have nowhere to go', () => {
    expect(resolveNotificationUrl(notif({ notification_type: 'general' }), 'eaglet')).toBeNull();
  });

  it('unknown types return null rather than a bad route', () => {
    expect(resolveNotificationUrl(notif({ notification_type: 'mystery' }), 'eaglet')).toBeNull();
  });
});
