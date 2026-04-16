import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
};

/**
 * Modal — generic accessible modal with backdrop, ESC key, Framer Motion
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  closeOnBackdrop = true,
}) => {
  const handleEsc = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              relative z-10 w-full ${sizeClasses[size]}
              bg-white rounded-2xl shadow-xl border border-slate-100
              flex flex-col max-h-[90vh]
              ${className}
            `}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  closeOnBackdrop: PropTypes.bool,
};

/**
 * ModalHeader — title row with close button
 */
const ModalHeader = ({ children, onClose, className = '' }) => (
  <div
    className={`flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0 ${className}`}
  >
    <h2 id="modal-title" className="text-lg font-bold text-slate-800">
      {children}
    </h2>
    {onClose && (
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Close modal"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

ModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

/**
 * ModalBody — scrollable content area
 */
const ModalBody = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto px-6 py-4 ${className}`}>
    {children}
  </div>
);

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * ModalFooter — sticky action row
 */
const ModalFooter = ({ children, className = '' }) => (
  <div
    className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 ${className}`}
  >
    {children}
  </div>
);

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
