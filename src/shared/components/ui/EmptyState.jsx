import PropTypes from 'prop-types';
import Button from './Button';

import Icon from '@shared/components/ui/Icon';

const EmptyState = ({
    icon = 'inbox',
    title = 'Nothing here yet',
    description,
    actionLabel,
    onAction,
    actionIcon,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-6 animate-fade-in ${className}`}>
            {/* Icon container with layered background */}
            <div className="relative mb-6">
                <div className="absolute inset-0 w-20 h-20 bg-primary/5 rounded-2xl rotate-6 transition-transform duration-500" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-200/60 shadow-sm">
                    <Icon name={icon} className='text-4xl text-slate-300' />
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-slate-500 text-center max-w-sm leading-relaxed mb-6">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onAction}
                    leftIcon={
                        actionIcon && (
                            <Icon name={actionIcon} className='text-lg' />
                        )
                    }
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
    actionIcon: PropTypes.string,
    className: PropTypes.string,
};

export default EmptyState;
