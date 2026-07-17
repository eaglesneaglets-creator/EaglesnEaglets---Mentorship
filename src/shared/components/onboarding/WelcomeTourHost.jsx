import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store';
import WelcomeTour from './WelcomeTour';
import { hasSeenTour } from './tour-storage';
import { getTourSteps } from './tour-steps';

/**
 * WelcomeTourHost — drop this once inside a role dashboard. It decides whether
 * the current user should see the first-run tour (right role, hasn't seen it
 * yet) and renders it. Keeping the decision here means the dashboards stay
 * clean — they just mount <WelcomeTourHost /> and forget about it.
 */
const WelcomeTourHost = () => {
  const { user } = useAuthStore();

  const steps = getTourSteps(user?.role);
  const userId = user?.id;

  // Decide once, at mount, whether to open — a lazy initializer keeps this out
  // of an effect (no setState-in-effect / cascading render). `dismissed` closes
  // it without re-triggering, since hasSeenTour is only re-read on remount.
  const [dismissed, setDismissed] = useState(false);
  const shouldShow = Boolean(steps) && Boolean(userId) && !hasSeenTour(userId);

  if (!steps) return null;

  return (
    <AnimatePresence>
      {shouldShow && !dismissed && (
        <WelcomeTour steps={steps} userId={userId} onClose={() => setDismissed(true)} />
      )}
    </AnimatePresence>
  );
};

export default WelcomeTourHost;
