/**
 * compressImage — downscale + re-encode an image in the browser before upload.
 *
 * Phone cameras produce 3-8 MB images; the KYC display-picture endpoint caps
 * uploads (MAX_IMAGE_SIZE_MB on the backend). Users were hitting that ceiling
 * on their first attempt with an ordinary ID photo, so we shrink client-side
 * instead of making them find an image editor.
 *
 * Uses canvas only — no dependency, no worker. Non-images and already-small
 * files pass through untouched so we never degrade a file that didn't need it.
 */

const DEFAULT_MAX_DIMENSION = 1600; // plenty for ID/selfie review
const DEFAULT_QUALITY = 0.82;
const DEFAULT_SKIP_BELOW_BYTES = 1024 * 1024; // 1 MB — already small enough

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = src;
  });

/**
 * @param {File} file - the user-selected file
 * @param {object} [opts]
 * @param {number} [opts.maxDimension=1600] - longest edge, in pixels
 * @param {number} [opts.quality=0.82] - JPEG quality, 0-1
 * @param {number} [opts.skipBelowBytes=1048576] - leave files smaller than this alone
 * @returns {Promise<File>} the compressed file, or the original when compression
 *   isn't applicable or wouldn't help. Never throws — falls back to the original.
 */
export async function compressImage(file, opts = {}) {
  const {
    maxDimension = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
    skipBelowBytes = DEFAULT_SKIP_BELOW_BYTES,
  } = opts;

  if (!file || !file.type?.startsWith('image/')) return file;
  // GIFs would lose animation and SVGs are vectors — canvas is wrong for both.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  if (file.size <= skipBelowBytes) return file;

  try {
    const img = await loadImage(await readAsDataUrl(file));

    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) return file;

    // Re-encoding can occasionally produce a LARGER file (e.g. a already-optimised
    // PNG of flat colour). Keep whichever is smaller.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    // Compression is an optimisation, never a gate — hand back the original and
    // let the server's own validation have the final say.
    return file;
  }
}

export default compressImage;
