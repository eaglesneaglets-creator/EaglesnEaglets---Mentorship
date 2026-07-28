import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * AnimatedBg — decorative drifting blobs behind page content.
 *
 * Extracted 2026-07-28: this markup was copy-pasted into 6 page files
 * byte-for-byte. The `variant` prop covers the one intentional colour
 * difference (GradingCenterPage's amber treatment) so pages share the motion
 * logic instead of each owning a copy.
 *
 * Note: NestCommunityHubPage keeps its own CSS-only `animate-blob` background —
 * a different implementation, deliberately not folded in here.
 */
const VARIANTS = {
  emerald: [
    {
      animate: { x: [0, 30, 0], y: [0, -20, 0] },
      transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
      className:
        'absolute top-10 right-20 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl',
    },
    {
      animate: { x: [0, -20, 0], y: [0, 30, 0] },
      transition: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
      className:
        'absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-3xl',
    },
  ],
  amber: [
    {
      animate: { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] },
      transition: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
      className:
        'absolute top-20 right-[10%] w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl',
    },
    {
      animate: { x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.2, 1] },
      transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
      className:
        'absolute bottom-20 left-[5%] w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-3xl',
    },
  ],
};

const AnimatedBg = ({ variant = 'emerald' }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
    {(VARIANTS[variant] || VARIANTS.emerald).map((blob, i) => (
      <motion.div
        key={i}
        animate={blob.animate}
        transition={blob.transition}
        className={blob.className}
      />
    ))}
  </div>
);

AnimatedBg.propTypes = {
  variant: PropTypes.oneOf(['emerald', 'amber']),
};

export default AnimatedBg;
