import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  truncate,
  capitalize,
  getInitials,
  cn,
} from './index';

describe('formatCurrency', () => {
  it('formats a number as GHS currency', () => {
    const result = formatCurrency(100);
    expect(result).toContain('100');
    expect(result).toMatch(/GH[C₵S]/); // GHS symbol varies by locale
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('accepts a custom currency', () => {
    const result = formatCurrency(50, 'USD');
    expect(result).toContain('50');
  });

  it('formats decimal amounts', () => {
    const result = formatCurrency(19.99);
    expect(result).toContain('19');
  });
});

describe('truncate', () => {
  it('returns the full string when shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis when over maxLength', () => {
    const result = truncate('hello world', 5);
    expect(result).toBe('hello...');
  });

  it('returns the string unchanged at exact maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('handles null/undefined gracefully', () => {
    expect(truncate(null)).toBeNull();
    expect(truncate(undefined)).toBeUndefined();
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });

  it('returns empty string for falsy input', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null)).toBe('');
  });
});

describe('getInitials', () => {
  it('returns initials from a full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns a single initial for a single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('returns empty string for falsy input', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials(null)).toBe('');
  });

  it('caps at 2 characters', () => {
    expect(getInitials('John Michael Doe').length).toBeLessThanOrEqual(2);
  });
});

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('returns empty string when all values are falsy', () => {
    expect(cn(null, undefined, false)).toBe('');
  });
});
