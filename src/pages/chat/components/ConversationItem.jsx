import { formatRelativeTime } from '@utils';
import { Avatar } from './_shared';

export default function ConversationItem({ conversation, isActive, onClick, currentUserId }) {
    const isNest = conversation.conversation_type === 'nest_group';
    const otherParticipant = isNest
        ? null
        : conversation.participants?.find((p) => p.id !== currentUserId);
    const displayName = isNest
        ? (conversation.nest_name || 'Nest Group')
        : otherParticipant
            ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
            : 'Unknown';
    const lastMsg = conversation.last_message;
    const unread = conversation.unread_count || 0;

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left ${isActive ? 'bg-primary/8 border-r-[3px] border-r-primary' : 'hover:bg-slate-50 border-r-[3px] border-r-transparent'}`}
        >
            <Avatar name={displayName} isNest={isNest} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {displayName}
                    </p>
                    {lastMsg?.created_at && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                            {formatRelativeTime(lastMsg.created_at)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${unread > 0 ? 'font-medium text-slate-600' : 'text-slate-400'}`}>
                        {lastMsg?.content || 'No messages yet'}
                    </p>
                    {unread > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
