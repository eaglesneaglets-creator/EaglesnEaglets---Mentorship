import { describe, it, expect } from 'vitest';
import { sizedAvatarUrl } from './avatarUrl';

/**
 * Phase 32-03 follow-up — avatars rendered soft/blurry.
 *
 * The backend stores the RAW Cloudinary secure_url: no f_auto, no q_auto, no
 * resize. Every avatar therefore downloaded a full-size upload and let the
 * browser scale it into a 32-96px box, which is exactly what looks fuzzy.
 * (The backend does compute optimized_url/thumbnail_url, but returns them once
 * and never persists them — nothing can read them later.)
 *
 * Fixing it at render time rather than upload time also repairs the pictures
 * already in the database, and covers Google avatars, which arrive at a fixed
 * =s96-c and were being UPSCALED into the 96px xl slot on 2x displays.
 */

const CLOUDINARY = 'https://res.cloudinary.com/demo/image/upload/v123/folder/pic.jpg';
const GOOGLE = 'https://lh3.googleusercontent.com/a/ABC123=s96-c';

// jsdom reports devicePixelRatio 1, so every test passes `dpr` explicitly
// rather than depending on the environment's display density.
const DPR = 2;

describe('sizedAvatarUrl — Cloudinary', () => {
  it('injects face-cropped resize + auto format/quality after /upload/', () => {
    const out = sizedAvatarUrl(CLOUDINARY, 40, DPR);
    // 40 CSS px at DPR 2 → 80 device px.
    expect(out).toContain('/upload/c_fill,g_face,w_80,h_80,f_auto,q_auto/');
    expect(out).toContain('/v123/folder/pic.jpg');
    expect(out.startsWith('https://res.cloudinary.com/demo/image/upload/')).toBe(true);
  });

  it('scales the request with the requested box', () => {
    expect(sizedAvatarUrl(CLOUDINARY, 96, DPR)).toContain('w_192,h_192');
    expect(sizedAvatarUrl(CLOUDINARY, 24, DPR)).toContain('w_48,h_48');
  });

  it('falls back to a 1x request on a standard-density display', () => {
    expect(sizedAvatarUrl(CLOUDINARY, 40, 1)).toContain('w_40,h_40');
  });

  it('is idempotent — never stacks a second transform', () => {
    const once = sizedAvatarUrl(CLOUDINARY, 40, DPR);
    const twice = sizedAvatarUrl(once, 40, DPR);
    expect(twice).toBe(once);
  });

  it('leaves an already-transformed URL alone', () => {
    // A URL that already carries transforms is assumed deliberate.
    const preset = 'https://res.cloudinary.com/demo/image/upload/w_400,h_400/v1/x.jpg';
    expect(sizedAvatarUrl(preset, 40)).toBe(preset);
  });
});

describe('sizedAvatarUrl — Google', () => {
  it('rewrites the =sNN size token instead of upscaling a 96px source', () => {
    expect(sizedAvatarUrl(GOOGLE, 96, DPR)).toBe(
      'https://lh3.googleusercontent.com/a/ABC123=s192-c',
    );
  });

  it('keeps the crop flag when present and adds a size when absent', () => {
    expect(sizedAvatarUrl('https://lh3.googleusercontent.com/a/X=s64', 40, DPR)).toBe(
      'https://lh3.googleusercontent.com/a/X=s80',
    );
    expect(sizedAvatarUrl('https://lh3.googleusercontent.com/a/X', 40, DPR)).toBe(
      'https://lh3.googleusercontent.com/a/X=s80',
    );
  });
});

describe('sizedAvatarUrl — passthrough and safety', () => {
  it('returns non-CDN URLs untouched', () => {
    const other = 'https://example.com/pic.jpg';
    expect(sizedAvatarUrl(other, 40, DPR)).toBe(other);
  });

  it('handles empty/invalid input without throwing', () => {
    expect(sizedAvatarUrl('', 40, DPR)).toBe('');
    expect(sizedAvatarUrl(null, 40, DPR)).toBe('');
    expect(sizedAvatarUrl(undefined, 40, DPR)).toBe('');
  });

  it('caps the device pixel ratio so a 3x phone cannot request a huge image', () => {
    const out = sizedAvatarUrl(CLOUDINARY, 96, 4);
    expect(out).toContain('w_192,h_192');
  });
});
