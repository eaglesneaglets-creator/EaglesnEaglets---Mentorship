/**
 * FeatureLockGuard — wraps an eaglet route. When the feature is locked
 * (mentee without active program), renders the underlying children with a
 * blurred backdrop and overlays a non-dismissable LockedFeatureModal on top.
 *
 * Plan 14.5-02: blur + non-dismissable modal pattern. Mentees see the page
 * shape but cannot interact until they enroll in a program.
 *
 * Eagles + admins always pass through unchanged.
 */

import PropTypes from 'prop-types';
import { useFeatureLock } from '@hooks/useFeatureLock';
import { LockedFeatureModal } from '@shared/components/feature-lock/LockedFeatureModal';

export function FeatureLockGuard({ featureKey, children }) {
  const { isLocked } = useFeatureLock(featureKey);
  if (!isLocked) return children;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none filter blur-sm"
      >
        {children}
      </div>
      <LockedFeatureModal open featureKey={featureKey} />
    </>
  );
}

FeatureLockGuard.propTypes = {
  featureKey: PropTypes.oneOf(['assignments', 'messages', 'resources', 'leaderboard']).isRequired,
  children: PropTypes.node.isRequired,
};
