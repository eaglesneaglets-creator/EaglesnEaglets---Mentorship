import { describe, it, expect } from 'vitest';
import { sanitizeUrl, stripCloudinarySignature } from './sanitize';

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows relative URLs starting with /', () => {
    expect(sanitizeUrl('/donations')).toBe('/donations');
  });

  it('allows hash links', () => {
    expect(sanitizeUrl('#section')).toBe('#section');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<h1>XSS</h1>')).toBe('');
  });

  it('blocks vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
  });

  it('blocks javascript with mixed case', () => {
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
  });
});

describe('stripCloudinarySignature', () => {
  it('strips s--TOKEN-- from a Cloudinary URL', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/s--abc123XY--/v1/sample.jpg';
    expect(stripCloudinarySignature(url)).toBe(
      'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    );
  });

  it('returns the URL unchanged if no signature present', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg';
    expect(stripCloudinarySignature(url)).toBe(url);
  });

  it('returns the input unchanged for non-string values', () => {
    expect(stripCloudinarySignature(null)).toBeNull();
    expect(stripCloudinarySignature(undefined)).toBeUndefined();
  });
});
