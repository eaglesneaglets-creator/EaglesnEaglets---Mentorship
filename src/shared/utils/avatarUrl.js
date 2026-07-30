/**
 * Size-appropriate avatar URLs (Phase 32-03 follow-up).
 *
 * WHY: the backend stores the raw Cloudinary `secure_url` — no resize, no
 * `f_auto`, no `q_auto`. Every avatar downloaded a full-resolution upload and
 * let the browser squeeze it into a 24-96px box, which renders soft. Google
 * avatars had the opposite problem: they arrive pinned at `=s96-c` and were
 * being upscaled into the 96px slot on 2x displays.
 *
 * Doing this at render time rather than upload time means it also fixes every
 * picture already in the database, and it keeps one URL in storage instead of
 * a column per size.
 */

/** Beyond 2x the extra bytes buy no visible sharpness on a small avatar. */
const MAX_DPR = 2;

/** Cloudinary delivery URLs look like `.../image/upload/<transforms?>/<version>/<path>`. */
const CLOUDINARY_UPLOAD = '/image/upload/';

/**
 * A path segment that is already a transformation — `w_400`, `c_fill`, `f_auto`,
 * `s--sig--`, etc. Version segments (`v123`) and plain folder names are not.
 */
const isTransformSegment = (segment) =>
  /^[a-z]{1,3}_[a-zA-Z0-9.:_-]+/.test(segment) && !/^v\d+$/.test(segment);

/**
 * Return `url` rewritten to deliver roughly `cssPx` at the display's pixel
 * density. Unrecognised hosts, empty input, and URLs that already carry explicit
 * transformations are returned unchanged.
 *
 * @param {string} url      Source image URL.
 * @param {number} cssPx    Rendered box size in CSS pixels.
 * @param {number} [dpr]    Device pixel ratio; defaults to the current display.
 * @returns {string}
 */
export function sizedAvatarUrl(url, cssPx, dpr) {
  if (!url || typeof url !== 'string') return '';

  const ratio = typeof dpr === 'number'
    ? dpr
    : (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  const px = Math.round(cssPx * Math.min(ratio, MAX_DPR));

  // ── Google (OAuth profile photos) ──────────────────────────────────────
  // Size lives in a trailing `=s96-c` token rather than the path.
  if (url.includes('googleusercontent.com')) {
    const [base, params] = url.split('=');
    // Preserve `-c` (centre-crop) when the original asked for it.
    const cropped = params?.includes('-c') ? '-c' : '';
    return `${base}=s${px}${cropped}`;
  }

  // ── Cloudinary ─────────────────────────────────────────────────────────
  const uploadAt = url.indexOf(CLOUDINARY_UPLOAD);
  if (uploadAt === -1) return url;

  const prefix = url.slice(0, uploadAt + CLOUDINARY_UPLOAD.length);
  const rest = url.slice(uploadAt + CLOUDINARY_UPLOAD.length);

  // Already transformed (by us on a previous call, or deliberately upstream) —
  // leave it alone rather than stacking a second transform.
  if (isTransformSegment(rest.split('/')[0])) return url;

  // `g_face` keeps the face centred when cropping to a square, matching the
  // backend's own 'avatar'/'profile' presets in core/storage.py.
  return `${prefix}c_fill,g_face,w_${px},h_${px},f_auto,q_auto/${rest}`;
}

export default sizedAvatarUrl;
