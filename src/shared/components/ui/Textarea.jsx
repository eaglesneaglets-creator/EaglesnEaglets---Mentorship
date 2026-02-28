import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Textarea Component
 * Multi-line text input with character count
 */
const Textarea = forwardRef(({
  label,
  name,
  placeholder,
  defaultValue,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  hint,
  rows = 4,
  maxLength,
  // eslint-disable-next-line no-unused-vars
  showCount = false,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = name || generatedId;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-text-primary"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
      </div>
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full rounded-lg border bg-white text-text-primary
          placeholder:text-text-muted
          px-4 py-3 resize-y min-h-[100px]
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-colors duration-200
          ${error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  hint: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  showCount: PropTypes.bool,
};

export default Textarea;
