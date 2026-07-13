import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@shared/components/ui/Modal';

export default function TransferSuperadminModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  candidates = [],
}) {
  const [successorId, setSuccessorId] = useState('');
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setSuccessorId('');
    setReason('');
    onClose();
  };

  const hasCandidates = candidates.length > 0;
  const canSubmit = hasCandidates && successorId && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ successorId, reason: reason.trim() });
  };

  return (
    <Modal isOpen={open} onClose={isLoading ? () => {} : handleClose} size="lg">
      <Modal.Header onClose={isLoading ? undefined : handleClose}>
        Transfer superadmin &amp; step down
      </Modal.Header>
      <Modal.Body>
        <p className="text-sm text-slate-600 mb-4">
          Choose who will become the next superadmin. You will lose all platform-admin
          privileges immediately after the transfer. Your mentor role and Nest are unaffected.
        </p>

        {!hasCandidates ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            There are no other platform admins to receive superadmin access.
            Invite at least one admin first, then return here to transfer.
          </div>
        ) : (
          <>
            <label
              htmlFor="successor-select"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
            >
              Next superadmin
            </label>
            <select
              id="successor-select"
              value={successorId}
              onChange={(e) => setSuccessorId(e.target.value)}
              disabled={isLoading}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 disabled:opacity-60"
            >
              <option value="">Select an admin…</option>
              {candidates.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.email})
                </option>
              ))}
            </select>
          </>
        )}

        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
          Note for audit log{' '}
          <span className="text-slate-400 normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional context for the audit log…"
          rows={4}
          maxLength={2000}
          disabled={isLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 resize-none disabled:opacity-60"
        />
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
          className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Transferring…' : 'Transfer & step down'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

TransferSuperadminModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  candidates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      full_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
};
