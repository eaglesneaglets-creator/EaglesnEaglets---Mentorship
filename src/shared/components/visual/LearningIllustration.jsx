import { motion } from 'framer-motion';
import aboutIllustration from '../../../assets/about-illustration.png';

/**
 * Students-learning hero artwork with gentle motion and orbiting accent glyphs.
 * Shared by Home and About so both surfaces use the same visual language.
 */
const LearningIllustration = () => (
    <div className="relative w-full h-full">
        <motion.div
            aria-hidden
            className="absolute inset-4 rounded-3xl bg-gradient-to-br from-emerald-100/50 via-transparent to-amber-100/30 blur-2xl"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.img
            src={aboutIllustration}
            alt="Diverse youth learning together"
            className="relative w-full h-full object-cover"
            loading="eager"
            decoding="async"
            animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
            aria-hidden
            className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white shadow-lg shadow-emerald-200/50 border border-emerald-100 flex items-center justify-center"
            animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
            <span className="material-symbols-outlined text-emerald-600 text-xl">menu_book</span>
        </motion.div>

        <motion.div
            aria-hidden
            className="absolute top-6 right-5 w-12 h-12 rounded-2xl bg-white shadow-lg shadow-amber-200/60 border border-amber-100 flex items-center justify-center"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
            <span className="material-symbols-outlined text-amber-500 text-2xl">lightbulb</span>
        </motion.div>

        <motion.div
            aria-hidden
            className="absolute top-1/2 -right-2 sm:-right-3 w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200/60 border border-slate-100 flex items-center justify-center"
            animate={{ y: [0, -8, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        >
            <span className="material-symbols-outlined text-slate-700 text-xl">school</span>
        </motion.div>

        <motion.span
            aria-hidden
            className="absolute top-12 right-1/3 text-amber-400"
            animate={{ y: [0, -16, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
        </motion.span>
        <motion.span
            aria-hidden
            className="absolute bottom-12 left-1/3 text-emerald-400"
            animate={{ y: [0, -14, 0], opacity: [0.3, 0.9, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
        >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
        </motion.span>
        <motion.span
            aria-hidden
            className="absolute top-1/3 left-8 text-emerald-300"
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
            <span className="material-symbols-outlined text-xs">circle</span>
        </motion.span>
    </div>
);

export default LearningIllustration;
