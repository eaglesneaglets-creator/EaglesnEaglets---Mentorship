/**
 * ConfirmModal — reusable destructive-action confirmation dialog.
 * Built on top of the generic Modal component.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *   // trigger: setConfirm({ title, message, onConfirm })
 *   <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
 */

import PropTypes from 'prop-types';
import Modal from './Modal';

export function ConfirmModal({ config, onClose }) {
  if (!config) return null;

  const { title = 'Are you sure?', message, confirmLabel = 'Confirm', variant = 'danger', onConfirm } = config;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-primary hover:bg-primary/90 text-white';

  return (
    <Modal isOpen={!!config} onClose={onClose} size="sm">
      <Modal.Header onClose={onClose}>{title}</Modal.Header>
      <Modal.Body>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnClass}`}
        >
          {confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    confirmLabel: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'primary']),
    onConfirm: PropTypes.func.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};
