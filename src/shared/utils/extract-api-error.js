/**
 * extractApiError — pull a human-readable message out of an axios error,
 * regardless of which backend error shape produced it.
 *
 * The Django backend can respond in three different shapes:
 *   1. Custom envelope   → { error: { message: "..." } }
 *   2. DRF field errors  → { new_password: ["This password is too short."] }
 *   3. DRF detail / NFE  → { detail: "..." } or { non_field_errors: ["..."] }
 *
 * A form that only reads one shape (e.g. `error.message`) silently swallows
 * the other two and shows a useless generic fallback. This walks all three.
 *
 * @param {unknown} err - axios error (or anything)
 * @returns {string} the first message found, or '' when nothing usable exists
 */
export function extractApiError(err) {
  const data = err?.response?.data;
  if (!data) return '';

  // Shape 1: our custom exception-handler envelope.
  if (typeof data.error?.message === 'string') return data.error.message;

  // Shape 3a: DRF's default detail key.
  if (typeof data.detail === 'string') return data.detail;

  // Shapes 2 & 3b: field errors and non_field_errors are keyed objects whose
  // values are usually arrays of strings. Prefer non_field_errors, then walk
  // the remaining keys in order and return the first message we can pull.
  const firstFromValue = (value) => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    return '';
  };

  if (data.non_field_errors) {
    const msg = firstFromValue(data.non_field_errors);
    if (msg) return msg;
  }

  if (typeof data === 'object') {
    for (const value of Object.values(data)) {
      const msg = firstFromValue(value);
      if (msg) return msg;
    }
  }

  return '';
}

export default extractApiError;
