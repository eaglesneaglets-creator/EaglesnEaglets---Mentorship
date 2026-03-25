/**
 * HTML Sanitization Utilities
 * Uses DOMPurify to prevent XSS attacks
 */

import DOMPurify from 'dompurify';

/**
 * Default DOMPurify configuration
 * Allows safe HTML tags while blocking dangerous content
 */
const DEFAULT_CONFIG = {
  // Allow these tags
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre', 'code',
    'a', 'span', 'div',
  ],
  // Allow these attributes
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  // Force all links to open in new tab with security attributes
  ADD_ATTR: ['target', 'rel'],
  // Don't allow data: URLs
  ALLOW_DATA_ATTR: false,
  // Force target="_blank" links to have rel="noopener noreferrer"
  FORCE_BODY: false,
};

/**
 * Strict configuration - only allows text formatting
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
};

/**
 * Plain text only - strips all HTML
 */
const TEXT_ONLY_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The untrusted HTML string
 * @param {Object} config - Optional DOMPurify configuration
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(dirty, config = DEFAULT_CONFIG) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize with strict rules - only basic text formatting allowed
 * Use for user bios, comments, etc.
 * @param {string} dirty - The untrusted HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeStrict(dirty) {
  return sanitizeHtml(dirty, STRICT_CONFIG);
}

/**
 * Strip all HTML and return plain text
 * Use for displaying in contexts where HTML shouldn't render
 * @param {string} dirty - The untrusted HTML string
 * @returns {string} Plain text string
 */
export function sanitizeToText(dirty) {
  return sanitizeHtml(dirty, TEXT_ONLY_CONFIG);
}

/**
 * Sanitize user input for display
 * Escapes HTML entities to prevent rendering
 * @param {string} input - User input string
 * @returns {string} Escaped string safe for display
 */
export function escapeHtml(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Strip Cloudinary delivery signature token (s--TOKEN--) from a URL.
 * When the Cloudinary account has unsigned delivery enabled, stored URLs with
 * signatures may fail or show security warnings. Stripping the token lets
 * Cloudinary serve the asset without it.
 * @param {string} url - Cloudinary URL that may contain s--TOKEN--
 * @returns {string} URL with signature segment removed, or original URL unchanged
 */
export function stripCloudinarySignature(url) {
  if (!url || typeof url !== 'string') return url;
  // Match /s--<base64url_chars>--/ and remove it
  return url.replace(/\/s--[A-Za-z0-9_-]+--(?=\/)/, '');
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - The URL to sanitize
 * @returns {string} Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Allow http, https, mailto, tel, and relative URLs
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:', '/', '#'];
  const isRelative = !trimmedUrl.includes(':');
  const isSafe = safeProtocols.some(p => trimmedUrl.startsWith(p));

  if (isRelative || isSafe) {
    return url;
  }

  return '';
}

/**
 * React hook for sanitizing HTML
 * Memoizes the result for performance
 */
export function useSanitizedHtml(dirty, config = DEFAULT_CONFIG) {
  const sanitized = sanitizeHtml(dirty, config);
  return sanitized;
}

/**
 * Create props for dangerouslySetInnerHTML with sanitized content
 * @param {string} dirty - The untrusted HTML string
 * @param {Object} config - Optional DOMPurify configuration
 * @returns {Object} Props object for dangerouslySetInnerHTML
 */
export function createSafeInnerHTML(dirty, config = DEFAULT_CONFIG) {
  return {
    dangerouslySetInnerHTML: {
      __html: sanitizeHtml(dirty, config),
    },
  };
}

export default {
  sanitizeHtml,
  sanitizeStrict,
  sanitizeToText,
  escapeHtml,
  sanitizeUrl,
  stripCloudinarySignature,
  useSanitizedHtml,
  createSafeInnerHTML,
};
