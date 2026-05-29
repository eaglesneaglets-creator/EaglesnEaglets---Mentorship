import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@shared/components/ui/Modal';

/**
 * Shared "give a reason / note" modal used by approve, reject, revoke flows.
 * Lets the caller set min length, title, button label/variant.
 */
export default function NoteModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  title,
  prompt,
  noteRequired = false,
  minLength = 0,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary', // 'primary' | 'danger'
  placeholder = 'Add a note…',
}) {
  const [note, setNote] = useState('');
  // Reset local draft via the close handler instead of an effect — avoids
  // a setState-in-effect compiler warning and keeps the reset deterministic.
  const handleClose = () => {
    setNote('');
    onClose();
  };

  const trimmed = note.trim();
  const remaining = Math.max(0, minLength - trimmed.length);
  const meetsMin = trimmed.length >= minLength;
  const canSubmit = !isLoading && (!noteRequired || meetsMin);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  const confirmBg = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  return (
    <Modal isOpen={open} onClose={isLoading ? () => {} : handleClose} size="lg">
      <Modal.Header onClose={isLoading ? undefined : handleClose}>{title}</Modal.Header>
      <Modal.Body>
        {prompt && <p className="text-sm text-slate-600 mb-4">{prompt}</p>}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={placeholder}
          rows={5}
          maxLength={1000}
          disabled={isLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 resize-none disabled:opacity-60"
        />
        {noteRequired && (
          <p className="mt-2 text-xs text-slate-500">
            {remaining > 0
              ? `${remaining} more character${remaining === 1 ? '' : 's'} required (minimum ${minLength}).`
              : `${trimmed.length} characters · ready.`}
          </p>
        )}
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
          className={`px-5 py-2.5 text-sm font-semibold text-white ${confirmBg} rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Working…' : confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

NoteModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  title: PropTypes.string.isRequired,
  prompt: PropTypes.node,
  noteRequired: PropTypes.bool,
  minLength: PropTypes.number,
  confirmLabel: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['primary', 'danger']),
  placeholder: PropTypes.string,
};
