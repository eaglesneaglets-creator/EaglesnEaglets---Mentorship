import { motion } from 'framer-motion';

/**
 * FloatingShapesBackground — decorative emerald orbs + shapes + grid.
 *
 * Previously animated continuously (animate-float-drift) which kept the
 * compositor busy every frame. Now it does ONE entrance reveal on mount,
 * then sits static — zero ongoing paint cost. Parent mounts this behind a
 * requestIdleCallback so it never competes with form interactivity.
 */
const Shape = ({ left, top, size, type, delay }) => {
  const inner = {
    circle: <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5" style={{ width: size, height: size }} />,
    ring: <div className="rounded-full border-2 border-primary/10" style={{ width: size, height: size }} />,
    feather: (
      <svg className="text-primary/10" style={{ width: size, height: size }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.12 6.71c-2.15-2.15-5.64-2.15-7.79 0l-2.12 2.12c-.59.59-.59 1.54 0 2.12.59.59 1.54.59 2.12 0l2.12-2.12c.98-.98 2.56-.98 3.54 0 .98.98.98 2.56 0 3.54l-6.36 6.36c-.98.98-2.56.98-3.54 0-.98-.98-.98-2.56 0-3.54l.71-.71c.59-.59.59-1.54 0-2.12-.59-.59-1.54-.59-2.12 0l-.71.71c-2.15 2.15-2.15 5.64 0 7.79 2.15 2.15 5.64 2.15 7.79 0l6.36-6.36c2.15-2.15 2.15-5.64 0-7.79z" />
      </svg>
    ),
    star: (
      <svg className="text-primary/[0.08]" style={{ width: size, height: size }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${left}%`, top: `${top}%` }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      {inner[type]}
    </motion.div>
  );
};

const FloatingShapesBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {/* Static gradient orbs — emerald theme */}
    <div
      className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.13) 0%, transparent 70%)' }}
    />
    <div
      className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, transparent 70%)' }}
    />

    {/* One-shot reveal shapes — hidden on mobile for clarity + perf */}
    <div className="hidden sm:block">
      <Shape left={5} top={15} size={40} type="circle" delay={0} />
      <Shape left={85} top={10} size={30} type="ring" delay={0.1} />
      <Shape left={15} top={70} size={25} type="feather" delay={0.2} />
      <Shape left={75} top={60} size={35} type="circle" delay={0.3} />
    </div>
    <div className="hidden lg:block">
      <Shape left={45} top={85} size={35} type="star" delay={0.15} />
      <Shape left={90} top={40} size={45} type="ring" delay={0.25} />
      <Shape left={25} top={35} size={25} type="feather" delay={0.35} />
      <Shape left={60} top={20} size={55} type="circle" delay={0.45} />
    </div>

    {/* Subtle grid — desktop only */}
    <div
      className="hidden sm:block absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}
    />
  </div>
);

export default FloatingShapesBackground;
