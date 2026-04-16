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
});
