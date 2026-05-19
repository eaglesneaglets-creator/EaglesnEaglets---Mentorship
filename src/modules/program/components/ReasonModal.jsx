/**
 * ReasonModal — captures an optional textarea reason for reject/release/decide
 * (plan 14-06 T4). Built on top of the generic Modal component.
 */
import PropTypes from 'prop-types';
import { useState } from 'react';
import Modal from '../../../shared/components/ui/Modal';

export default function ReasonModal({ config, onClose }) {
    const [reason, setReason] = useState('');
    const [lastConfig, setLastConfig] = useState(config);

    // Reset reason whenever the config identity changes (modal reopened
    // for a different action). React docs-recommended pattern over useEffect.
    if (config !== lastConfig) {
        setLastConfig(config);
        setReason('');
    }

    if (!config) return null;

    const {
        title = 'Provide a reason',
        message,
        confirmLabel = 'Submit',
        variant = 'danger',
        required = false,
        onConfirm,
    } = config;

    const valid = !required || reason.trim().length > 0;

    const handleConfirm = () => {
        if (!valid) return;
        onConfirm?.(reason.trim());
        onClose();
    };

    const btnClass =
        variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-primary hover:bg-primary/90 text-white';

    return (
        <Modal isOpen={!!config} onClose={onClose} size="sm">
            <Modal.Header onClose={onClose}>{title}</Modal.Header>
            <Modal.Body>
                {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder={required ? 'Required — explain your decision' : 'Optional — share context with the mentee'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
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
                    disabled={!valid}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}
                >
                    {confirmLabel}
                </button>
            </Modal.Footer>
        </Modal>
    );
}

ReasonModal.propTypes = {
    config: PropTypes.shape({
        title: PropTypes.string,
        message: PropTypes.string,
        confirmLabel: PropTypes.string,
        variant: PropTypes.oneOf(['danger', 'primary']),
        required: PropTypes.bool,
        onConfirm: PropTypes.func.isRequired,
    }),
    onClose: PropTypes.func.isRequired,
};
