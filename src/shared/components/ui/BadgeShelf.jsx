import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBadges } from '../../../modules/points/hooks/usePoints';

export default function BadgeShelf() {
    const { data, isLoading } = useBadges();
    const badges = data?.data ?? [];

    if (isLoading) {
        return (
            <div className="flex gap-2 items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                ))}
            </div>
        );
    }

    if (badges.length === 0) {
        return (
            <p className="text-sm text-slate-400 italic">
                No badges yet — keep learning to earn your first!
            </p>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0 scrollbar-hide">
                {badges.slice(0, 8).map((ub, i) => {
                    const badge = ub.badge ?? ub; // handle both UserBadge and Badge shapes
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            title={badge.name}
                            className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-sm"
                        >
                            <img src={badge.icon} alt={badge.name} className="w-full h-full" />
                        </motion.div>
                    );
                })}
                {badges.length > 8 && (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-500">
                        +{badges.length - 8}
                    </div>
                )}
            </div>
            <Link
                to="/eaglet/badges"
                className="text-xs font-semibold text-primary whitespace-nowrap flex-shrink-0 hover:underline"
            >
                View all →
            </Link>
        </div>
    );
}
