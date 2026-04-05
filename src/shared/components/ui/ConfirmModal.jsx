/**
 * ConfirmModal — reusable destructive-action confirmation dialog.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *   // trigger: setConfirm({ title, message, onConfirm })
 *   <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
 */

import PropTypes from 'prop-types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
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
