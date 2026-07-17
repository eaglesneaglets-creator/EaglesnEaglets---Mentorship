import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { markTourSeen } from './tour-storage';

/**
 * WelcomeTour — a first-run, role-aware walkthrough shown once to brand-new
 * users. Deliberately a centered step-modal rather than an element-anchored
 * spotlight: it's robust to layout changes and needs no refs threaded through
 * the dashboard. Built on framer-motion (already bundled) so we add no new dep.
 *
 * Persistence lives in ./tour-storage (localStorage, keyed per user) so the
 * tour never re-nags.
 */

const WelcomeTour = ({ steps, userId, onClose }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const total = steps.length;
  const step = steps[index];
  const isLast = index === total - 1;

  const finish = useCallback(
    (cta) => {
      markTourSeen(userId);
      onClose?.();
      if (cta?.to) navigate(cta.to);
    },
    [userId, onClose, navigate],
  );

  // Esc closes (and marks seen) — standard modal affordance.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' && !isLast) setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, isLast, index]);

  if (!step) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-tour-title"
    >
      {/* Scrim */}
      <motion.div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => finish()}
      />

      <motion.div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        {/* Skip */}
        <button
          type="button"
          onClick={() => finish()}
          className="absolute top-4 right-4 z-10 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip
        </button>

        {/* Illustrated header band */}
        <div className="relative h-28 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-400/30 rounded-full blur-2xl" />
          <AnimatePresence mode="wait">
            <motion.span
              key={step.icon}
              className="material-symbols-outlined text-white text-5xl relative z-10"
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {step.icon}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <h2 id="welcome-tour-title" className="text-xl font-bold text-slate-900 mb-2">
                {step.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6 mb-6">
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-primary' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (index > 0 ? setIndex((i) => i - 1) : finish())}
              className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {index > 0 ? 'Back' : 'Skip'}
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => finish(step.cta)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
              >
                {step.cta?.label || 'Get started'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => i + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
              >
                Next
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

WelcomeTour.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired, // material-symbols name
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      cta: PropTypes.shape({ label: PropTypes.string, to: PropTypes.string }),
    }),
  ).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
};

export default WelcomeTour;
