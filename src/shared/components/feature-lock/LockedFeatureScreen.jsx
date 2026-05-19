/**
 * LockedFeatureScreen — full-page lock state rendered when a mentee navigates
 * directly to a gated route (plan 14-05). Used by FeatureLockGuard.
 */

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const FEATURE_LABELS = {
  assignments: 'Assignments',
  messages: 'Messages',
  resources: 'Resources',
};

export function LockedFeatureScreen({ featureKey }) {
  const featureLabel = FEATURE_LABELS[featureKey] ?? 'This feature';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10 text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        {featureLabel} is locked
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        Join a community to unlock this feature. Once a mentor approves your
        program enrollment, all gated areas open up.
      </p>
      <Link
        to="/eaglet/nest"
        className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Browse communities
      </Link>
    </div>
  );
}

LockedFeatureScreen.propTypes = {
  featureKey: PropTypes.oneOf(['assignments', 'messages', 'resources']).isRequired,
};
