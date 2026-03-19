import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * AnimatedNestCard Component
 * A consistent, animated, light-themed glassmorphic card for Nest presentation across dashboards.
 */
const AnimatedNestCard = ({ title, description, image, icon, iconColor, memberCount, additionalInfo, linkTo, delay = 0 }) => {
    return (
        <div
            className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-slate-200/60 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 ease-out hover:-translate-y-1 h-72 flex flex-col"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Image Header */}
            <div className="h-32 w-full bg-cover bg-center relative overflow-hidden flex-shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[1000ms] group-hover:scale-105"
                    style={{ backgroundImage: `url(${image || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow relative bg-white/60 backdrop-blur-md">
                {/* Floating Icon */}
                <div className={`absolute -top-6 right-5 w-12 h-12 rounded-xl border border-white/80 bg-white/95 backdrop-blur shadow-lg flex items-center justify-center transition-all duration-700 ease-out group-hover:shadow-xl group-hover:-translate-y-1 ${iconColor}`}>
                    <span className="material-symbols-outlined transition-transform duration-700 group-hover:rotate-12">{icon}</span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 pr-14 leading-tight mb-1 group-hover:text-primary transition-colors duration-500">{title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow font-medium leading-relaxed">{description}</p>

                {/* Footer info & Link */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        {memberCount !== undefined && (
                            <span className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50 transition-colors group-hover:bg-slate-200/60">
                                <span className="material-symbols-outlined text-[14px]">group</span>
                                {memberCount}
                            </span>
                        )}
                        {additionalInfo && (
                            <span className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50 transition-colors group-hover:bg-slate-200/60">
                                <span className="material-symbols-outlined text-[14px]">info</span>
                                {additionalInfo}
                            </span>
                        )}
                    </div>
                    {linkTo && (
                        <Link
                            to={linkTo}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 ease-out hover:scale-110"
                        >
                            <span className="material-symbols-outlined text-sm transition-transform duration-500 group-hover:translate-x-0.5">arrow_forward</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/0 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-[1000ms] pointer-events-none" />
        </div>
    );
};

AnimatedNestCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    memberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    additionalInfo: PropTypes.string,
    linkTo: PropTypes.string,
    delay: PropTypes.number,
};

AnimatedNestCard.defaultProps = {
    icon: 'diversity_3',
    iconColor: 'text-primary',
};

export default AnimatedNestCard;
