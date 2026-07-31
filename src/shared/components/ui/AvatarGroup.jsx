import PropTypes from 'prop-types';
import Avatar from './Avatar';

/**
 * AvatarGroup — overlapping stack of faces with a "+N" overflow chip.
 *
 * Phase 32-02: per-face rendering now delegates to <Avatar>. This file
 * previously carried its OWN `getInitials` + COLORS palette, and read
 * `avatar || profile_picture` only — so it never showed the `avatar_url` that
 * 32-01 added. Delegating fixes both and leaves one initials implementation.
 *
 * Layout (negative margins, ring, hover lift, overflow chip) is unchanged.
 */

// Overlap + ring are group concerns, so they stay here; the circle itself is Avatar's.
const GROUP_SIZE_CLASSES = {
    sm: { avatar: 'xs', wrapper: '-ml-2 first:ml-0 ring-2' },
    md: { avatar: 'sm', wrapper: '-ml-2.5 first:ml-0 ring-2' },
    lg: { avatar: 'md', wrapper: '-ml-3 first:ml-0 ring-[3px]' },
};

const CHIP_SIZE_CLASSES = {
    sm: 'w-7 h-7 text-[10px] -ml-2 ring-2',
    md: 'w-9 h-9 text-xs -ml-2.5 ring-2',
    lg: 'w-11 h-11 text-sm -ml-3 ring-[3px]',
};

const AvatarGroup = ({ users = [], max = 4, size = 'md', className = '' }) => {
    const displayed = users.slice(0, max);
    const remaining = users.length - max;
    const cfg = GROUP_SIZE_CLASSES[size] || GROUP_SIZE_CLASSES.md;

    return (
        <div className={`flex items-center ${className}`}>
            {displayed.map((user, i) => (
                <Avatar
                    key={user.id || i}
                    user={user}
                    size={cfg.avatar}
                    className={`ring-white transition-transform duration-300 hover:scale-110 hover:z-10 ${cfg.wrapper}`}
                    style={{ zIndex: displayed.length - i }}
                />
            ))}

            {remaining > 0 && (
                <div
                    className={`rounded-full ring-white flex items-center justify-center font-bold bg-slate-100 text-slate-600 border border-slate-200/60 ${CHIP_SIZE_CLASSES[size] || CHIP_SIZE_CLASSES.md}`}
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
            // avatar_url is the Phase 32-01 canonical field; the others are legacy
            // payload shapes Avatar still understands.
            avatar_url: PropTypes.string,
            avatar: PropTypes.string,
            profile_picture: PropTypes.string,
        })
    ),
    max: PropTypes.number,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
};

export default AvatarGroup;
