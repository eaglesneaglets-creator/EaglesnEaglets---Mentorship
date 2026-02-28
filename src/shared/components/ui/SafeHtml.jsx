/**
 * SafeHtml Component
 * Safely renders HTML content with XSS protection via DOMPurify
 */

import PropTypes from 'prop-types';
import { sanitizeHtml, sanitizeStrict, sanitizeToText } from '../../utils/sanitize';

/**
 * SafeHtml - Renders sanitized HTML content
 *
 * @example
 * // Default - allows common formatting tags
 * <SafeHtml content={userBio} />
 *
 * @example
 * // Strict - only basic text formatting
 * <SafeHtml content={userComment} mode="strict" />
 *
 * @example
 * // Text only - strips all HTML
 * <SafeHtml content={untrustedContent} mode="text" />
 *
 * @example
 * // With custom wrapper
 * <SafeHtml content={article} as="article" className="prose" />
 */
const SafeHtml = ({
  content,
  mode = 'default',
  as: Component = 'div',
  className = '',
  ...props
}) => {
  if (!content) {
    return null;
  }

  let sanitized;
  switch (mode) {
    case 'strict':
      sanitized = sanitizeStrict(content);
      break;
    case 'text':
      sanitized = sanitizeToText(content);
      // For text mode, just render as text content, not innerHTML
      return (
        <Component className={className} {...props}>
          {sanitized}
        </Component>
      );
    default:
      sanitized = sanitizeHtml(content);
  }

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      {...props}
    />
  );
};

SafeHtml.propTypes = {
  /** The HTML content to sanitize and render */
  content: PropTypes.string,
  /** Sanitization mode: 'default', 'strict', or 'text' */
  mode: PropTypes.oneOf(['default', 'strict', 'text']),
  /** The HTML element to render as */
  as: PropTypes.elementType,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default SafeHtml;
