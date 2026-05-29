import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@shared/components/ui/Modal';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteAdminModal({ open, onClose, onSubmit, isLoading }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Reset draft via the close handler — avoids the setState-in-effect warning.
  const handleClose = () => {
    setEmail('');
    setMessage('');
    onClose();
  };

  const validEmail = EMAIL_RE.test(email.trim());
  const canSubmit = validEmail && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ email: email.trim().toLowerCase(), message: message.trim() });
  };

  return (
    <Modal isOpen={open} onClose={isLoading ? () => {} : handleClose} size="lg">
      <Modal.Header onClose={isLoading ? undefined : handleClose}>
        Invite a new admin
      </Modal.Header>
      <Modal.Body>
        <p className="text-sm text-slate-600 mb-4">
          Send a 48-hour invite link to a specific email address. The recipient
          must sign in with this email to accept.
        </p>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={isLoading}
          className="w-full h-12 px-5 rounded-full border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 disabled:opacity-60"
        />
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
          Personal note <span className="text-slate-400 normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a short note for the invite email…"
          rows={3}
          maxLength={500}
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
          className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending…' : 'Send invite'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

InviteAdminModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
