import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * ProfilePictureUpload Component
 * Circular profile picture upload with preview
 */
const ProfilePictureUpload = ({
  value,
  onFileSelect,
  onUpload,
  isUploading = false,
  error,
  disabled = false,
  className = '',
}) => {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Notify parent
    if (onFileSelect) {
      onFileSelect(file);
    }

    // Auto-upload if handler provided
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-32 h-32 rounded-full overflow-hidden
          border-4 transition-all duration-200 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDragging
            ? 'border-primary border-dashed bg-primary/5'
            : error
              ? 'border-error'
              : 'border-border hover:border-primary'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {preview ? (
          /* Image Preview */
          <>
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs">Change</span>
              </div>
            </div>
          </>
        ) : (
          /* Upload Prompt */
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-text-muted">
            {isUploading ? (
              <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Add Photo</span>
              </>
            )}
          </div>
        )}

        {/* Remove button */}
        {preview && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center shadow-md hover:bg-error/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Label */}
      <p className="mt-3 text-sm text-text-secondary">
        {isUploading ? 'Uploading...' : 'Profile Picture'}
        <span className="text-error ml-1">*</span>
      </p>

      {/* Hint */}
      <p className="mt-1 text-xs text-text-muted">
        JPG, PNG or WebP. Max 2MB.
      </p>

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </div>
  );
};

ProfilePictureUpload.propTypes = {
  value: PropTypes.string,
  onFileSelect: PropTypes.func,
  onUpload: PropTypes.func,
  isUploading: PropTypes.bool,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfilePictureUpload;
