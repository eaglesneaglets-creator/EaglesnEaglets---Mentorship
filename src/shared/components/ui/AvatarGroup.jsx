import PropTypes from 'prop-types';

const COLORS = [
    'from-emerald-400 to-green-500',
    'from-blue-400 to-indigo-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-purple-400 to-violet-500',
    'from-cyan-400 to-teal-500',
];

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
};

const AvatarGroup = ({ users = [], max = 4, size = 'md', className = '' }) => {
    const displayed = users.slice(0, max);
    const remaining = users.length - max;

    const sizeClasses = {
        sm: 'w-7 h-7 text-[10px] -ml-2 first:ml-0 ring-2',
        md: 'w-9 h-9 text-xs -ml-2.5 first:ml-0 ring-2',
        lg: 'w-11 h-11 text-sm -ml-3 first:ml-0 ring-[3px]',
    };

    return (
        <div className={`flex items-center ${className}`}>
            {displayed.map((user, i) => {
                const name = user.name || user.first_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : '';

                return user.avatar || user.profile_picture ? (
                    <img
                        key={user.id || i}
                        src={user.avatar || user.profile_picture}
                        alt={name}
                        title={name}
                        className={`
                            rounded-full ring-white object-cover
                            transition-transform duration-300 hover:scale-110 hover:z-10
                            ${sizeClasses[size]}
                        `.trim().replace(/\s+/g, ' ')}
                        style={{ zIndex: displayed.length - i }}
                    />
                ) : (
                    <div
                        key={user.id || i}
                        title={name}
                        className={`
                            rounded-full ring-white flex items-center justify-center font-bold text-white
                            bg-gradient-to-br ${COLORS[i % COLORS.length]}
                            transition-transform duration-300 hover:scale-110 hover:z-10
                            ${sizeClasses[size]}
                        `.trim().replace(/\s+/g, ' ')}
                        style={{ zIndex: displayed.length - i }}
                    >
                        {getInitials(name)}
                    </div>
                );
            })}

            {remaining > 0 && (
                <div
                    className={`
                        rounded-full ring-white flex items-center justify-center font-bold
                        bg-slate-100 text-slate-600 border border-slate-200/60
                        ${sizeClasses[size]}
                    `.trim().replace(/\s+/g, ' ')}
                    style={{ zIndex: 0 }}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
};

AvatarGroup.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string,
            first_name: PropTypes.string,
            last_name: PropTypes.string,
            avatar: PropTypes.string,
            profile_picture: PropTypes.string,
        })
    ),
    max: PropTypes.number,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
};

export default AvatarGroup;
