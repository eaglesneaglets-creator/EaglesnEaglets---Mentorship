import PropTypes from 'prop-types';

/**
 * Alert Component
 * Notification/message component with variants
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  onClose,
  className = '',
  ...props
}) => {
  const variants = {
    info: {
      bg: 'bg-info-light',
      border: 'border-info/30',
      text: 'text-blue-800',
      iconColor: 'text-info',
    },
    success: {
      bg: 'bg-success-light',
      border: 'border-success/30',
      text: 'text-green-800',
      iconColor: 'text-success',
    },
    warning: {
      bg: 'bg-warning-light',
      border: 'border-warning/30',
      text: 'text-amber-800',
      iconColor: 'text-warning',
    },
    error: {
      bg: 'bg-error-light',
      border: 'border-error/30',
      text: 'text-red-800',
      iconColor: 'text-error',
    },
  };

  const defaultIcons = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const { bg, border, text, iconColor } = variants[variant];

  return (
    <div
      role="alert"
      className={`
        ${bg} ${border} ${text}
        border rounded-lg p-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          {icon || defaultIcons[variant]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={`
              flex-shrink-0 p-1 rounded-lg
              hover:bg-black/5 transition-colors
              ${iconColor}
            `}
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  icon: PropTypes.node,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
