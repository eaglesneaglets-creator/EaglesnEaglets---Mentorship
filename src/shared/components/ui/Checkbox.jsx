import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Checkbox Component
 * Styled checkbox with label and description
 */
const Checkbox = forwardRef(({
  label,
  name,
  checked = false,
  onChange,
  description,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const checkboxId = name || generatedId;

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={checkboxId}
        className={`
          flex items-start gap-3 cursor-pointer
          ${disabled ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            id={checkboxId}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-all duration-200
              flex items-center justify-center
              peer-focus:ring-2 peer-focus:ring-primary/20 peer-focus:ring-offset-1
              ${checked
                ? 'bg-primary border-primary'
                : error
                  ? 'border-error'
                  : 'border-border hover:border-primary'
              }
            `}
          >
            {checked && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1">
          {label && (
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <p className="text-sm text-text-secondary mt-0.5">
              {description}
            </p>
          )}
        </div>
      </label>
      {error && (
        <p className="mt-1.5 text-sm text-error ml-8">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  description: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Checkbox;
