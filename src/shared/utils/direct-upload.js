/**
 * Direct-to-Cloudinary upload helper.
 *
 * Replaces the file-through-BE pipeline (FormData → BE → Cloudinary → BE → FE)
 * with FE → Cloudinary in one hop. BE only signs short-lived params.
 *
 * Why: the proxy pipeline hit SSL EOF / 90s retry stalls and consumed BE
 * RAM + bandwidth for every byte. Direct uploads scale horizontally and
 * give real upload progress.
 *
 * Usage:
 *   const { secureUrl, bytes, publicId } = await directUpload(file, {
 *     context: 'content_item',
 *     onProgress: (pct) => setProgress(pct),
 *     signal: abortController.signal,
 *   });
 */

import { apiClient } from '@api';

class DirectUploadError extends Error {
  constructor(message, { code, cause } = {}) {
    super(message);
    this.name = 'DirectUploadError';
    this.code = code;
    if (cause) this.cause = cause;
  }
}

/**
 * Validate a file against the rules returned by /uploads/sign/. We re-check
 * client-side BEFORE the upload so we don't waste a roundtrip on a known
 * reject. The BE signature still enforces folder constraints.
 */
const validate = (file, { maxBytes, allowedMime }) => {
  if (!file) throw new DirectUploadError('No file selected.', { code: 'NoFile' });
  if (allowedMime?.length && file.type && !allowedMime.includes(file.type)) {
    throw new DirectUploadError(
      `Unsupported file type "${file.type}". Allowed: ${allowedMime.join(', ')}`,
      { code: 'BadMime' },
    );
  }
  if (maxBytes && file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    throw new DirectUploadError(
      `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max ${mb} MB.`,
      { code: 'TooLarge' },
    );
  }
};

/**
 * Upload directly to Cloudinary via XHR. Returns a promise that resolves
 * with { secureUrl, bytes, publicId, resourceType, raw } or rejects with
 * a DirectUploadError. Caller may cancel by aborting `signal`.
 */
export const directUpload = async (file, { context, onProgress, signal } = {}) => {
  if (!context) throw new DirectUploadError('upload context is required', { code: 'NoContext' });

  // 1. Ask BE for signed params + the rules for client-side validation.
  let signed;
  try {
    const resp = await apiClient.post('/uploads/sign/', { context });
    signed = resp?.data || resp;
  } catch (err) {
    throw new DirectUploadError(
      err?.message || 'Could not authorize upload. Please try again.',
      { code: 'SignFailed', cause: err },
    );
  }

  validate(file, {
    maxBytes: signed.max_bytes,
    allowedMime: signed.allowed_mime,
  });

  // 2. POST the file directly to Cloudinary.
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.api_key);
    form.append('timestamp', String(signed.timestamp));
    form.append('signature', signed.signature);
    form.append('folder', signed.folder);
    form.append('use_filename', 'true');
    form.append('unique_filename', 'true');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', signed.upload_url, true);

    if (typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            secureUrl: data.secure_url,
            url: data.url,
            publicId: data.public_id,
            bytes: data.bytes,
            resourceType: data.resource_type,
            format: data.format,
            raw: data,
          });
        } catch (err) {
          reject(new DirectUploadError('Malformed response from upload service.', {
            code: 'BadResponse',
            cause: err,
          }));
        }
      } else {
        let detail = `Upload failed (HTTP ${xhr.status}).`;
        try {
          const data = JSON.parse(xhr.responseText);
          if (data?.error?.message) detail = data.error.message;
        } catch { /* keep default detail */ }
        reject(new DirectUploadError(detail, { code: 'UploadFailed' }));
      }
    };

    xhr.onerror = () => reject(new DirectUploadError(
      'Network error during upload. Check your connection.',
      { code: 'NetworkError' },
    ));

    xhr.ontimeout = () => reject(new DirectUploadError(
      'Upload timed out. Try a smaller file or a stronger connection.',
      { code: 'Timeout' },
    ));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new DirectUploadError('Upload cancelled.', { code: 'Aborted' }));
        return;
      }
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DirectUploadError('Upload cancelled.', { code: 'Aborted' }));
      }, { once: true });
    }

    xhr.send(form);
  });
};

