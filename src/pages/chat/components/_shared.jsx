import SharedAvatar from '../../../shared/components/ui/Avatar';

/**
 * Chat avatar. Phase 32-03: the person branch now delegates to the shared
 * <Avatar>, so a real profile picture shows here instead of a single letter.
 * Pass `user` (the chat payloads carry `avatar_url` via UserMinimalSerializer);
 * `name` alone still works and simply falls back to initials.
 *
 * The nest branch stays hand-rolled — it is a group icon, not a person, and has
 * no picture to resolve.
 */
export const Avatar = ({ user, name, isOnline, size = 'md', isNest = false }) => {
    // Chat's sm/md/lg names match the shared scale's, so `size` passes straight
    // through. Chat's md is w-11 against the shared w-10 — a 4px difference.
    const nestSizes = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg' };
    return (
        <div className="relative flex-shrink-0">
            {isNest ? (
                <div className={`${nestSizes[size]} rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 text-white`}>
                    <span className="material-symbols-outlined text-base">groups</span>
                </div>
            ) : (
                <SharedAvatar user={user} name={name} size={size} />
            )}
            {typeof isOnline === 'boolean' && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            )}
        </div>
    );
};

export const ConnectionBadge = ({ status }) => {
    if (status === 'open') return null;
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${status === 'connecting' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
            {status === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
        </div>
    );
};

export const ConversationSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
        <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
        </div>
    </div>
);
