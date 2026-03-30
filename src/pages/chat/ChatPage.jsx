import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { formatRelativeTime } from '@utils';
import {
    useConversations,
    useMessages,
    useChatSocket,
    useMarkRead,
    useContacts,
    useCreateDM,
} from '../../modules/chat/hooks/useChat';

/* ─── Avatar Component ─── */
const Avatar = ({ name, isOnline, size = 'md', isNest = false }) => {
    const initial = name?.charAt(0)?.toUpperCase() || '?';
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg' };
    return (
        <div className="relative flex-shrink-0">
            <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold ${isNest ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white' : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'}`}>
                {isNest ? <span className="material-symbols-outlined text-base">groups</span> : initial}
            </div>
            {typeof isOnline === 'boolean' && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            )}
        </div>
    );
};

/* ─── Conversation List Item ─── */
const ConversationItem = ({ conversation, isActive, onClick, currentUserId }) => {
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
};

/* ─── Emoji Reaction Picker ─── */
const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const EmojiPicker = ({ onSelect, isOwn }) => (
    <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-9 z-20 flex items-center gap-1 bg-white border border-slate-100 rounded-full shadow-lg px-2 py-1`}>
        {QUICK_EMOJIS.map((emoji) => (
            <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="text-base hover:scale-125 transition-transform duration-150 leading-none"
            >
                {emoji}
            </button>
        ))}
    </div>
);

/* ─── Message Bubble ─── */
const MessageBubble = ({ message, isOwn, showAvatar, senderName, reactions, onReact }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    // Close picker on outside click
    useEffect(() => {
        if (!showPicker) return;
        const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPicker]);

    const msgReactions = reactions?.[message.id] || {};
    const hasReactions = Object.keys(msgReactions).length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            {!isOwn && showAvatar ? <Avatar name={senderName} size="sm" /> : !isOwn ? <div className="w-8 h-8 flex-shrink-0" /> : null}
            <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Bubble + hover react button */}
                <div className="relative" ref={pickerRef}>
                    {/* Emoji picker popup */}
                    {showPicker && !message.is_deleted && (
                        <EmojiPicker isOwn={isOwn} onSelect={(emoji) => { onReact(message.id, emoji); setShowPicker(false); }} />
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md shadow-sm'}`}>
                        {message.is_deleted ? <em className="text-slate-400">[deleted]</em> : message.content}
                    </div>
                    {/* Hover react trigger */}
                    {!message.is_deleted && (
                        <button
                            onClick={() => setShowPicker((v) => !v)}
                            className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-7' : '-right-7'} opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-xs`}
                        >
                            😊
                        </button>
                    )}
                </div>

                {/* Reaction pills */}
                {hasReactions && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(msgReactions).map(([emoji, users]) => (
                            users.size > 0 && (
                                <button
                                    key={emoji}
                                    onClick={() => onReact(message.id, emoji)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs transition-colors border border-slate-200"
                                >
                                    {emoji} <span className="font-semibold text-slate-600">{users.size}</span>
                                </button>
                            )
                        ))}
                    </div>
                )}

                <p className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
};

/* ─── Coming Soon Dropdown ─── */
const ComingSoonDropdown = ({ onClose }) => {
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 px-4 flex items-center gap-2 whitespace-nowrap animate-fade-in"
        >
            <span className="material-symbols-outlined text-base text-amber-400">schedule</span>
            <span className="text-sm font-medium text-slate-600">Coming Soon</span>
        </div>
    );
};

/* ─── Chat Header ─── */
const ChatHeader = ({ conversation, onBack, currentUserId }) => {
    const [openDropdown, setOpenDropdown] = useState(null); // 'call' | 'video' | null

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
                {/* Voice call */}
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
                {/* Video call */}
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
                <button className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-xl text-slate-400">search</span>
                </button>
                <button className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-xl text-slate-400">more_vert</span>
                </button>
            </div>
        </div>
    );
};

/* ─── Message Input ─── */
const MessageInput = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const handleSend = () => {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };
    return (
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={disabled ? 'Connecting...' : 'Type a message...'}
                        disabled={disabled}
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50"
                        style={{ maxHeight: '120px' }}
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-0.5 shadow-sm shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">send</span>
                </motion.button>
            </div>
        </div>
    );
};

/* ─── Connection Status Indicator ─── */
const ConnectionBadge = ({ status }) => {
    if (status === 'open') return null;
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${status === 'connecting' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
            {status === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
        </div>
    );
};

/* ─── New Chat Dropdown ─── */
const NewChatDropdown = ({ onSelect, onClose }) => {
    const { data: contacts = [], isLoading } = useContacts();
    const [filter, setFilter] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const filtered = useMemo(() => {
        if (!filter.trim()) return contacts;
        const q = filter.toLowerCase();
        return contacts.filter((c) =>
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
        );
    }, [contacts, filter]);

    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach((c) => {
            const label = c.role === 'eagle' ? 'Mentors' : c.role === 'admin' ? 'Admins' : 'Eaglets';
            if (!groups[label]) groups[label] = [];
            groups[label].push(c);
        });
        return groups;
    }, [filtered]);

    return (
        <div ref={dropdownRef} className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
            <div className="p-2 border-b border-slate-100">
                <input
                    type="text"
                    autoFocus
                    placeholder="Search contacts..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
            <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="py-6 text-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : Object.keys(grouped).length > 0 ? (
                    Object.entries(grouped).map(([label, users]) => (
                        <div key={label}>
                            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            {users.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => onSelect(u.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{u.first_name} {u.last_name}</p>
                                        <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="py-6 text-center">
                        <span className="material-symbols-outlined text-2xl text-slate-300">person_off</span>
                        <p className="text-xs text-slate-400 mt-1">No contacts found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Skeleton Loaders ─── */
const ConversationSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
        <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
        </div>
    </div>
);

/* ─── Main Chat Page ─── */
const ChatPage = () => {
    const { user } = useAuthStore();
    const [activeConversation, setActiveConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileList, setShowMobileList] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef(null);
    // reactions: { [messageId]: { [emoji]: Set<userId> } }
    const [reactions, setReactions] = useState({});
    const handleReact = useCallback((messageId, emoji) => {
        setReactions((prev) => {
            const msgReactions = { ...(prev[messageId] || {}) };
            const users = new Set(msgReactions[emoji] || []);
            if (users.has(user?.id)) {
                users.delete(user?.id);
            } else {
                users.add(user?.id);
            }
            return { ...prev, [messageId]: { ...msgReactions, [emoji]: users } };
        });
    }, [user?.id]);

    const { data: conversations = [], isLoading: convsLoading } = useConversations();
    const { data: messages = [], isLoading: msgsLoading } = useMessages(
        activeConversation?.id,
        { enabled: !!activeConversation }
    );
    const { status: wsStatus, sendMessage } = useChatSocket(activeConversation?.id);
    const markReadMutation = useMarkRead();
    const createDMMutation = useCreateDM();

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark conversation as read when opened
    useEffect(() => {
        if (activeConversation?.id) {
            markReadMutation.mutate(activeConversation.id);
        }
    }, [activeConversation?.id]);

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter((c) => {
            const isNest = c.conversation_type === 'nest_group';
            if (isNest) return c.nest_name?.toLowerCase().includes(q);
            const other = c.participants?.find((p) => p.id !== user?.id);
            return `${other?.first_name} ${other?.last_name}`.toLowerCase().includes(q);
        });
    }, [conversations, searchQuery, user?.id]);

    const totalUnread = useMemo(
        () => conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
        [conversations]
    );

    const handleSelectConversation = useCallback((conv) => {
        setActiveConversation(conv);
        setShowMobileList(false);
    }, []);

    const handleSendMessage = useCallback((content) => {
        sendMessage(content);
    }, [sendMessage]);

    const handleNewChat = useCallback(async (userId) => {
        setShowNewChat(false);
        try {
            const result = await createDMMutation.mutateAsync(userId);
            const conv = result?.data;
            if (conv) {
                setActiveConversation(conv);
                setShowMobileList(false);
            }
        } catch {
            // toast handled by useCreateDM hook
        }
    }, [createDMMutation]);

    const variant = user?.role === 'eagle' ? 'eagle' : user?.role === 'admin' ? 'admin' : 'eaglet';

    return (
        <DashboardLayout variant={variant}>
            <div className="h-[calc(100vh-7rem)] flex flex-col">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-emerald-600 flex items-center justify-center shadow-md shadow-primary/15">
                            <span className="material-symbols-outlined text-white text-xl">chat</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                            <p className="text-xs text-slate-400">
                                {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
                            </p>
                        </div>
                    </div>
                    {activeConversation && (
                        <ConnectionBadge status={wsStatus} />
                    )}
                </div>

                {/* Chat Layout */}
                <div className="flex-1 flex rounded-2xl border border-slate-200/50 bg-white shadow-sm overflow-hidden min-h-0">
                    {/* Conversations Sidebar */}
                    <div className={`w-full lg:w-80 flex-shrink-0 border-r border-slate-100 flex flex-col ${!showMobileList ? 'hidden lg:flex' : 'flex'}`}>
                        {/* Search + New Chat */}
                        <div className="p-3 border-b border-slate-100">
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowNewChat((v) => !v)}
                                    title="New conversation"
                                    className={`w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                                        showNewChat
                                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showNewChat ? 'close' : 'person_add'}
                                    </span>
                                </button>
                            </div>
                            {/* New Chat Dropdown */}
                            {showNewChat && (
                                <div className="relative mt-2">
                                    <NewChatDropdown
                                        onSelect={handleNewChat}
                                        onClose={() => setShowNewChat(false)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto">
                            {convsLoading ? (
                                <>
                                    <ConversationSkeleton />
                                    <ConversationSkeleton />
                                    <ConversationSkeleton />
                                </>
                            ) : filteredConversations.length > 0 ? (
                                filteredConversations.map((conv) => (
                                    <ConversationItem
                                        key={conv.id}
                                        conversation={conv}
                                        isActive={activeConversation?.id === conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                        currentUserId={user?.id}
                                    />
                                ))
                            ) : (
                                <div className="py-12 text-center px-4">
                                    <span className="material-symbols-outlined text-3xl text-slate-300">chat_bubble</span>
                                    <p className="text-sm text-slate-400 mt-2">No conversations yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className={`flex-1 flex flex-col min-w-0 ${showMobileList ? 'hidden lg:flex' : 'flex'}`}>
                        {activeConversation ? (
                            <>
                                <ChatHeader
                                    conversation={activeConversation}
                                    onBack={() => setShowMobileList(true)}
                                    currentUserId={user?.id}
                                />
                                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50/30">
                                    {msgsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">chat_bubble_outline</span>
                                            <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isOwn = msg.sender_id === user?.id;
                                            const prevMsg = messages[index - 1];
                                            const showAvatar = !isOwn && prevMsg?.sender_id !== msg.sender_id;
                                            const senderName = msg.sender?.full_name || msg.sender?.first_name || 'Unknown';
                                            return (
                                                <MessageBubble
                                                    key={msg.id}
                                                    message={msg}
                                                    isOwn={isOwn}
                                                    showAvatar={showAvatar}
                                                    senderName={senderName}
                                                    reactions={reactions}
                                                    onReact={handleReact}
                                                />
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <MessageInput
                                    onSend={handleSendMessage}
                                    disabled={wsStatus !== 'open'}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">forum</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Select a conversation</h3>
                                <p className="text-sm text-slate-400">Choose a conversation from the sidebar to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChatPage;
