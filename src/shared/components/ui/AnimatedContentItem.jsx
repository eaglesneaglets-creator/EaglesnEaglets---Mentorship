import PropTypes from 'prop-types';

/**
 * AnimatedContentItem Component
 * A consistent, animated UI for displaying content or resources in lists across dashboards.
 */
const AnimatedContentItem = ({ icon, iconBg, title, subtitle, rightElement, delay = 0, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`relative flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 hover:bg-white/90 hover:border-primary/30 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/5 overflow-hidden ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Shimmer on Hover */}
            <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Icon Area */}
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-10`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 z-10">
                <h4 className="text-slate-900 text-base font-semibold truncate group-hover:text-primary transition-colors duration-300">{title}</h4>
                <p className="text-slate-500 text-sm truncate">{subtitle}</p>
            </div>

            {/* Right Element (Status, Action) */}
            <div className="z-10 bg-white/50 backdrop-blur py-1 px-2 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors duration-300">
                {rightElement}
            </div>
        </div>
    );
};

AnimatedContentItem.propTypes = {
    icon: PropTypes.string.isRequired,
    iconBg: PropTypes.string,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    rightElement: PropTypes.node,
    delay: PropTypes.number,
    onClick: PropTypes.func,
};

AnimatedContentItem.defaultProps = {
    iconBg: 'bg-primary/10 text-primary',
};

export default AnimatedContentItem;
