/**
 * Shared Utilities
 * Helper functions used across modules
 *
 * Note: sanitize helpers are NOT re-exported here. Every consumer imports them
 * directly from './sanitize', and re-exporting made this barrel pull the
 * sanitize module (and DOMPurify) into any bundle that only wanted formatDate.
 */

/**
 * Format currency (Ghanaian Cedi)
 */
export const formatCurrency = (amount, currency = 'GHS') => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, options = {}, fallback = '—') => {
  // Same epoch trap as formatRelativeTime: `new Date(null)` is 1970-01-01, not
  // an invalid date, so an unset value would render as "Jan 1, 1970".
  if (date === null || date === undefined || date === '') return fallback;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return fallback;

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-GH', defaultOptions).format(parsed);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date, fallback = 'No activity yet') => {
  // Guard the empty cases FIRST. `new Date(null)` does not produce an invalid
  // date — JS coerces null to 0, i.e. the Unix epoch — so an unset timestamp
  // silently rendered as "56 years ago" (2026 − 1970) instead of an empty state.
  // A wrong-but-believable value is worse than an obvious error.
  // Pass a custom `fallback` where different wording suits the surface.
  if (date === null || date === undefined || date === '') return fallback;

  const past = new Date(date);
  if (Number.isNaN(past.getTime())) return fallback;

  const now = new Date();
  const diffInSeconds = Math.floor((now - past) / 1000);

  // Future timestamps (clock skew) shouldn't read as "x ago".
  if (diffInSeconds < 0) return 'just now';

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// `getInitials` was removed here in Phase 32-03. It had no production callers and
// its contract disagreed with the canonical one ('John' → 'J' vs 'JO', '' → ''
// vs '?'), so re-exporting the canonical version under this name would have been
// a silent behaviour change. Import from `shared/utils/initials` instead — or
// better, use <Avatar>, which handles the picture-vs-initials decision for you.

/**
 * Class name utility (simple alternative to clsx)
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
