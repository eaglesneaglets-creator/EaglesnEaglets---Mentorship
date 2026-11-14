import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  full: 'sm:max-w-5xl',
};

/**
 * Modal — the app's generic dialog, built on shadcn/ui Dialog (Radix).
 *
 * Same props as before, so existing callers are unchanged. Radix supplies
 * what the hand-rolled version lacked: focus is trapped inside and restored
 * on close, Escape closes, background content is hidden from screen readers,
 * and page scroll is locked without leaking on unmount.
 *
 * On phones it docks to the bottom edge as a sheet.
 */
const Modal = ({
  isOpen,
  onClose,
  size = 'md',
  children,
  className = '',
  closeOnBackdrop = true,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent
      showCloseButton={false}
      aria-describedby={undefined}
      onInteractOutside={(event) => { if (!closeOnBackdrop) event.preventDefault(); }}
      className={cn(
        // Layout: header / scrolling body / footer.
        'flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-2xl border-slate-100 bg-white p-0 shadow-xl',
        // Phones: bottom sheet.
        'max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[92svh] max-sm:max-w-none max-sm:translate-y-0',
        'max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[env(safe-area-inset-bottom)]',
        'max-sm:data-[state=open]:slide-in-from-bottom-4 max-sm:data-[state=open]:zoom-in-100',
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </DialogContent>
  </Dialog>
);

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** @deprecated Title text now comes from <Modal.Header>. Kept so old callers don't warn. */
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  closeOnBackdrop: PropTypes.bool,
};

/**
 * ModalHeader — title row with close button. The title is the dialog's
 * accessible name.
 */
const ModalHeader = ({ children, onClose, className = '' }) => (
  <div
    className={cn(
      'flex flex-shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-4 max-sm:px-5 max-sm:pt-4 max-sm:pb-3',
      className,
    )}
  >
    <DialogTitle className="text-lg font-bold text-slate-800">{children}</DialogTitle>
    {onClose && (
      <DialogClose
        className="grid size-9 flex-shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Close"
      >
        <X className="size-5" aria-hidden="true" />
      </DialogClose>
    )}
  </div>
);

ModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

/** ModalBody — scrollable content area */
const ModalBody = ({ children, className = '' }) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4 max-sm:px-5', className)}>
    {children}
  </div>
);

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/** ModalFooter — sticky action row; buttons stack full-width on phones */
const ModalFooter = ({ children, className = '' }) => (
  <div
    className={cn(
      'flex flex-shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-6 py-4',
      'max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-5 max-sm:[&>*]:min-h-11 max-sm:[&>*]:w-full',
      className,
    )}
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
