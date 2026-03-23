import { motion } from 'framer-motion';

/**
 * Shared StatCard component — auto-selects visual style from props:
 *
 *  gradient  prop  → Admin gradient card (full colored bg, white text, decorative circle)
 *  iconColor prop  → Eaglet watermark card (large faint bg icon, optional progress bar)
 *  iconBg    prop  → Eagle shimmer card (icon on right, shimmer hover effect)
 *  colorClass prop → Default card (GradingCenter-style: icon square on left, motion.div lift)
 */
const StatCard = ({
    icon,
    // Eagle shimmer / Admin gradient
    iconBg,
    hoverBorder,
    // Eaglet watermark
    iconColor,
    subValue,
    subColor = 'text-emerald-600',
    progress,
    // Admin gradient
    gradient,
    change,
    // GradingCenter default
    colorClass,
    // Common
    label,
    value,
    delay = 0,
}) => {
    // ── Admin gradient style ─────────────────────────────────────────────────
    if (gradient) {
        return (
            <div
                className={`group relative rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${gradient}`}
                style={{ animationDelay: `${delay}ms` }}
            >
                <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="80" cy="80" r="60" fill="currentColor" className="text-white" />
                    </svg>
                </div>
                <div className="relative flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <div className={`p-2 md:p-2.5 rounded-xl w-fit mb-1 md:mb-2 ${iconBg}`}>
                            <span className="material-symbols-outlined text-lg md:text-xl">{icon}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
                            {change !== undefined && change !== null && (
                                <span className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                                    <span className="material-symbols-outlined text-xs">
                                        {change > 0 ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {Math.abs(change)}%
                                </span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm font-medium text-white/80">{label}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Eaglet watermark style ───────────────────────────────────────────────
    if (iconColor) {
        return (
            <div
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${delay}ms` }}
            >
                <div className={`absolute top-0 right-0 p-3 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${iconColor}`}>
                    <span className="material-symbols-outlined text-4xl md:text-6xl">{icon}</span>
                </div>
                <p className="text-slate-500 text-xs md:text-sm font-medium">{label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-slate-900 text-xl md:text-2xl font-bold">{value}</p>
                    {subValue && <p className={`text-xs font-bold ${subColor}`}>{subValue}</p>}
                </div>
                {progress !== undefined && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // ── Eagle shimmer style ──────────────────────────────────────────────────
    if (iconBg) {
        return (
            <div
                className={`group relative bg-white/70 backdrop-blur-md rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-700 ease-out hover:-translate-y-1 overflow-hidden ${hoverBorder ? `hover:border-${hoverBorder}/30` : ''}`}
                style={{ animationDelay: `${delay}ms` }}
            >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div className="relative flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 text-xs md:text-sm font-medium">{label}</p>
                        <p className="text-slate-900 text-2xl md:text-3xl font-bold transition-colors duration-500">{value}</p>
                    </div>
                    <div className={`p-2 md:p-2.5 rounded-xl ${iconBg} transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1`}>
                        <span className="material-symbols-outlined text-lg md:text-xl transition-transform duration-500 group-hover:rotate-6">{icon}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ── Default (GradingCenter) style ────────────────────────────────────────
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 shadow-sm flex items-center gap-5 transition-all duration-300"
        >
            <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center shadow-inner`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
