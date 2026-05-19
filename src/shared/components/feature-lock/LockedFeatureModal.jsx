/**
 * LockedFeatureModal — non-dismissable lock modal shown when a mentee
 * accesses a gated section without an active program enrollment.
 *
 * Plan 14.5-02:
 *   - No close (X) button
 *   - Clicking the overlay does NOT close
 *   - Single CTA: "Go to Nest"
 *   - Hard gate — user must navigate away to dismiss
 */

import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const FEATURE_LABELS = {
    assignments: 'Assignments',
    messages: 'Messages',
    resources: 'Resources',
    leaderboard: 'Leaderboard',
};

export function LockedFeatureModal({ open, featureKey, onClose: _onClose }) {
    const navigate = useNavigate();
    if (!open) return null;

    const featureLabel = FEATURE_LABELS[featureKey] ?? 'This feature';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="locked-feature-title"
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 sm:p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                </div>
                <h2
                    id="locked-feature-title"
                    className="text-xl font-extrabold text-slate-900 mb-2"
                >
                    Join a Nest to unlock
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {featureLabel} unlocks once a mentor approves your program
                    enrollment. Connect with a mentor to access assignments,
                    messages, leaderboard, and resources.
                </p>
                <button
                    type="button"
                    autoFocus
                    onClick={() => navigate('/eaglet/nest')}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary-dark transition active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                    Go to Nest
                </button>
            </div>
        </div>
    );
}

LockedFeatureModal.propTypes = {
    open: PropTypes.bool.isRequired,
    featureKey: PropTypes.oneOf(['assignments', 'messages', 'resources', 'leaderboard']).isRequired,
    onClose: PropTypes.func, // intentionally optional — modal is non-dismissable
};
