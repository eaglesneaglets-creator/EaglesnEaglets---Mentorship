import PropTypes from 'prop-types';

const STATUS_CONFIG = {
    pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200/60',
        dot: 'bg-amber-400',
        icon: 'schedule',
    },
    approved: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200/60',
        dot: 'bg-emerald-400',
        icon: 'check_circle',
    },
    declined: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200/60',
        dot: 'bg-red-400',
        icon: 'cancel',
    },
    active: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200/60',
        dot: 'bg-blue-400',
        icon: 'radio_button_checked',
    },
    completed: {
        bg: 'bg-primary-50',
        text: 'text-primary-700',
        border: 'border-primary-200/60',
        dot: 'bg-primary',
        icon: 'task_alt',
    },
    inactive: {
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        border: 'border-slate-200/60',
        dot: 'bg-slate-400',
        icon: 'do_not_disturb_on',
    },
};

const StatusBadge = ({ status, label, size = 'sm', showDot = true, showIcon = false, className = '' }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    const displayLabel = label || status?.charAt(0).toUpperCase() + status?.slice(1);

    const sizeClasses = {
        xs: 'px-2 py-0.5 text-[10px]',
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 font-semibold rounded-full border
                transition-all duration-300
                ${config.bg} ${config.text} ${config.border}
                ${sizeClasses[size]}
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
            )}
            {showIcon && (
                <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
            )}
            {displayLabel}
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOf(['pending', 'approved', 'declined', 'active', 'completed', 'inactive']).isRequired,
    label: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md']),
    showDot: PropTypes.bool,
    showIcon: PropTypes.bool,
    className: PropTypes.string,
};

export default StatusBadge;
