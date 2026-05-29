import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@shared/components/ui/Modal';

/**
 * Modal for submitting an admin-role Expression of Interest.
 * The reason field must be ≥50 chars — enforced server-side too.
 */
export default function EOISubmitModal({ open, onClose, onSubmit, isLoading }) {
  const [reason, setReason] = useState('');

  // Reset draft via the close handler instead of an effect to avoid the
  // setState-in-effect compiler warning. Deterministic + same UX.
  const handleClose = () => {
    setReason('');
    onClose();
  };

  const trimmed = reason.trim();
  const remaining = Math.max(0, 50 - trimmed.length);
  const canSubmit = remaining === 0 && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  return (
    <Modal isOpen={open} onClose={isLoading ? () => {} : handleClose} size="lg">
      <Modal.Header onClose={isLoading ? undefined : handleClose}>
        Request admin role
      </Modal.Header>
      <Modal.Body>
        <p className="text-sm text-slate-600 mb-4">
          Tell the existing admin team why you want to take on platform-admin
          responsibilities. Be specific — what would you contribute, and what
          capacity do you have?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Share your motivation, background, and what you'd help with…"
          rows={6}
          maxLength={2000}
          disabled={isLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 resize-none disabled:opacity-60"
        />
        <p className="mt-2 text-xs text-slate-500">
          {remaining > 0
            ? `${remaining} more character${remaining === 1 ? '' : 's'} required (minimum 50).`
            : `${trimmed.length} characters · looks good.`}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting…' : 'Submit request'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

EOISubmitModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
