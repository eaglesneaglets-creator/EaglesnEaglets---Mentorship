import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatDate } from './index';

describe('formatRelativeTime', () => {
  it('returns "just now" for a very recent timestamp', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago for a recent past time', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toMatch(/minute/);
  });

  it('returns hours ago for an older timestamp', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(twoHoursAgo);
    expect(result).toMatch(/hour/);
  });

  it('returns days ago for a day-old timestamp', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(twoDaysAgo);
    expect(result).toMatch(/day/);
  });

  it('uses plural form for multiple units', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toContain('2 hours ago');
  });

  it('uses singular form for one unit', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toContain('1 hour ago');
  });

  // --- Empty / invalid input -------------------------------------------
  // Regression: `new Date(null)` is NOT an invalid date — JS coerces null to 0,
  // giving the Unix epoch. A user who had never logged in therefore rendered as
  // "56 years ago" (2026 − 1970) instead of "Never". A wrong-but-believable
  // value is worse than an obvious error, so these cases are locked here.
  it('returns the empty-state label for null (NOT the 1970 epoch)', () => {
    expect(formatRelativeTime(null)).toBe('No activity yet');
    expect(formatRelativeTime(null)).not.toMatch(/year/);
  });

  it('returns the empty-state label for undefined and empty string', () => {
    expect(formatRelativeTime(undefined)).toBe('No activity yet');
    expect(formatRelativeTime('')).toBe('No activity yet');
  });

  it('returns the empty-state label for an unparseable value', () => {
    expect(formatRelativeTime('not-a-date')).toBe('No activity yet');
  });

  it('accepts a custom fallback', () => {
    expect(formatRelativeTime(null, 'Never signed in')).toBe('Never signed in');
  });

  it('does not render a future timestamp as "ago"', () => {
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(inAnHour)).toBe('just now');
  });
});

describe('formatDate', () => {
  it('formats a date string into a readable format', () => {
    const result = formatDate('2026-01-15');
    // Should contain the year
    expect(result).toContain('2026');
  });

  it('accepts a Date object', () => {
    const date = new Date('2026-04-08');
    const result = formatDate(date);
    expect(result).toContain('2026');
  });

  // Same epoch trap as above — an unset date must not render as "Jan 1, 1970".
  it('returns a dash for null/undefined/empty rather than the 1970 epoch', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate(null)).not.toContain('1970');
  });

  it('returns a dash for an unparseable value', () => {
    expect(formatDate('nonsense')).toBe('—');
  });
});
