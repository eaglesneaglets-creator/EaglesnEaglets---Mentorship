import { useState } from 'react';
import { Avatar } from './_shared';
import ComingSoonDropdown from './ComingSoonDropdown';

export default function ChatHeader({ conversation, onBack, currentUserId }) {
    const [openDropdown, setOpenDropdown] = useState(null);

    if (!conversation) return null;
    const isNest = conversation.conversation_type === 'nest_group';
    const other = isNest ? null : conversation.participants?.find((p) => p.id !== currentUserId);
    const displayName = isNest ? (conversation.nest_name || 'Nest Group') : other ? `${other.first_name} ${other.last_name}` : 'Unknown';
    const subtitle = isNest
        ? `${conversation.participants?.length || 0} members`
        : other?.role === 'eagle' ? 'Mentor' : 'Mentee';

    const toggleDropdown = (name) =>
        setOpenDropdown((prev) => (prev === name ? null : name));

    return (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-white">
            <button onClick={onBack} className="lg:hidden w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-xl text-slate-500">arrow_back</span>
            </button>
            <Avatar name={displayName} isNest={isNest} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
            <div className="flex items-center gap-1">
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('call')}
                        title="Voice call"
                        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl text-slate-400">call</span>
                    </button>
                    {openDropdown === 'call' && (
                        <ComingSoonDropdown onClose={() => setOpenDropdown(null)} />
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('video')}
                        title="Video call"
                        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl text-slate-400">videocam</span>
                    </button>
                    {openDropdown === 'video' && (
                        <ComingSoonDropdown onClose={() => setOpenDropdown(null)} />
                    )}
                </div>
                <button
                    disabled
                    title="Coming soon"
                    className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center opacity-60 cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-xl text-slate-400">search</span>
                </button>
                <button
                    disabled
                    title="Coming soon"
                    className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center opacity-60 cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-xl text-slate-400">more_vert</span>
                </button>
            </div>
        </div>
    );
}
