import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { formatRelativeTime } from '../../shared/utils';

/* ─── Mock Data ─── */
const MOCK_CONVERSATIONS = [
    {
        id: 'conv-1',
        type: 'direct',
        participant: { id: 'u1', first_name: 'Sarah', last_name: 'Adeyemi', role: 'eagle', avatar: null, is_online: true },
        last_message: { text: 'Great progress on the assignment! Keep it up.', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), sender_id: 'u1' },
        unread_count: 2,
    },
    {
        id: 'conv-2',
        type: 'direct',
        participant: { id: 'u2', first_name: 'James', last_name: 'Okafor', role: 'eaglet', avatar: null, is_online: false },
        last_message: { text: 'Thank you for the feedback on my project!', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), sender_id: 'u2' },
        unread_count: 0,
    },
    {
        id: 'conv-3',
        type: 'nest',
        nest: { id: 'n1', name: 'Web Dev Nest', member_count: 12 },
        participant: { id: 'n1', first_name: 'Web Dev', last_name: 'Nest', role: 'nest' },
        last_message: { text: 'New learning materials have been posted for this week.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), sender_id: 'u1' },
        unread_count: 5,
    },
    {
        id: 'conv-4',
        type: 'direct',
        participant: { id: 'u3', first_name: 'Amara', last_name: 'Nwankwo', role: 'eaglet', avatar: null, is_online: true },
        last_message: { text: 'Can we schedule a mentoring session this week?', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), sender_id: 'u3' },
        unread_count: 1,
    },
    {
        id: 'conv-5',
        type: 'direct',
        participant: { id: 'u4', first_name: 'David', last_name: 'Eze', role: 'eagle', avatar: null, is_online: false },
        last_message: { text: 'I reviewed your submission. Let\'s discuss tomorrow.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), sender_id: 'u4' },
        unread_count: 0,
    },
];

const generateMockMessages = () => {
    const now = Date.now();
    const msgs = [
        { id: 'm1', text: 'Hey! How is your progress on the current module?', sender_id: 'u1', created_at: new Date(now - 1000 * 60 * 60).toISOString() },
        { id: 'm2', text: 'Hi! I just completed the video lectures. Working on the assignment now.', sender_id: 'me', created_at: new Date(now - 1000 * 60 * 55).toISOString() },
        { id: 'm3', text: 'That\'s fantastic! Remember to review the key concepts before starting the assignment.', sender_id: 'u1', created_at: new Date(now - 1000 * 60 * 50).toISOString() },
        { id: 'm4', text: 'Will do! I had a question about the API integration section.', sender_id: 'me', created_at: new Date(now - 1000 * 60 * 45).toISOString() },
        { id: 'm5', text: 'Sure, what\'s your question? I\'m happy to help clarify things.', sender_id: 'u1', created_at: new Date(now - 1000 * 60 * 40).toISOString() },
        { id: 'm6', text: 'In the REST API section, should we use authentication tokens or session-based auth for the project?', sender_id: 'me', created_at: new Date(now - 1000 * 60 * 35).toISOString() },
        { id: 'm7', text: 'Great question! For this project, JWT tokens would be the best approach. They\'re stateless and work well with our React frontend.', sender_id: 'u1', created_at: new Date(now - 1000 * 60 * 30).toISOString() },
        { id: 'm8', text: 'Got it, thanks! I\'ll implement JWT auth then. Also, I earned 50 points from the last quiz!', sender_id: 'me', created_at: new Date(now - 1000 * 60 * 10).toISOString() },
        { id: 'm9', text: 'Great progress on the assignment! Keep it up. 🎉', sender_id: 'u1', created_at: new Date(now - 1000 * 60 * 5).toISOString() },
    ];
    return msgs;
};

/* ─── Avatar Component ─── */
const Avatar = ({ name, isOnline, size = 'md', isNest = false }) => {
    const initial = name?.charAt(0)?.toUpperCase() || '?';
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-11 h-11 text-sm',
        lg: 'w-14 h-14 text-lg',
    };

    return (
        <div className="relative flex-shrink-0">
            <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold ${isNest ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white' : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'}`}>
                {isNest ? (
                    <span className="material-symbols-outlined text-base">groups</span>
                ) : (
                    initial
                )}
            </div>
            {typeof isOnline === 'boolean' && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            )}
        </div>
    );
};

/* ─── Conversation List Item ─── */
const ConversationItem = ({ conversation, isActive, onClick }) => {
    const { participant, last_message, unread_count, type, nest } = conversation;
    const displayName = type === 'nest'
        ? nest.name
        : `${participant.first_name} ${participant.last_name}`;

    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left
                ${isActive
                    ? 'bg-primary/8 border-r-[3px] border-r-primary'
                    : 'hover:bg-slate-50 border-r-[3px] border-r-transparent'
                }
            `}
        >
            <Avatar
                name={participant.first_name}
                isOnline={type === 'direct' ? participant.is_online : undefined}
                isNest={type === 'nest'}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${unread_count > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {displayName}
                    </p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                        {formatRelativeTime(last_message.created_at)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${unread_count > 0 ? 'font-medium text-slate-600' : 'text-slate-400'}`}>
                        {last_message.text}
                    </p>
                    {unread_count > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {unread_count > 9 ? '9+' : unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

/* ─── Message Bubble ─── */
const MessageBubble = ({ message, isOwn, showAvatar, senderName }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
        {!isOwn && showAvatar ? (
            <Avatar name={senderName} size="sm" />
        ) : !isOwn ? (
            <div className="w-8 h-8 flex-shrink-0" />
        ) : null}

        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
            <div className={`
                px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isOwn
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md shadow-sm'
                }
            `}>
                {message.text}
            </div>
            <p className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    </motion.div>
);

/* ─── Chat Header ─── */
const ChatHeader = ({ conversation, onBack }) => {
    if (!conversation) return null;
    const { participant, type, nest } = conversation;
    const displayName = type === 'nest' ? nest.name : `${participant.first_name} ${participant.last_name}`;
    const subtitle = type === 'nest'
        ? `${nest.member_count} members`
        : participant.role === 'eagle' ? 'Mentor' : 'Mentee';

    return (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-white">
            <button
                onClick={onBack}
                className="lg:hidden w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
                <span className="material-symbols-outlined text-xl text-slate-500">arrow_back</span>
            </button>
            <Avatar
                name={participant.first_name}
                isOnline={type === 'direct' ? participant.is_online : undefined}
                isNest={type === 'nest'}
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-400">
                    {type === 'direct' && participant.is_online ? (
                        <span className="text-emerald-500 font-medium">Online</span>
                    ) : subtitle}
                </p>
            </div>
            <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-xl text-slate-400">search</span>
                </button>
                <button className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-xl text-slate-400">more_vert</span>
                </button>
            </div>
        </div>
    );
};

/* ─── Message Input ─── */
const MessageInput = ({ onSend }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
                <button className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors flex-shrink-0 mb-0.5">
                    <span className="material-symbols-outlined text-xl text-slate-400">attach_file</span>
                </button>
                <div className="flex-1 relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        style={{ maxHeight: '120px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-0.5 shadow-sm shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">send</span>
                </motion.button>
            </div>
        </div>
    );
};

/* ─── Main Chat Page ─── */
const ChatPage = () => {
    const { user } = useAuthStore();
    const [activeConversation, setActiveConversation] = useState(null);
    const [conversations] = useState(MOCK_CONVERSATIONS);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileList, setShowMobileList] = useState(true);
    const messagesEndRef = useRef(null);

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter((c) => {
            const name = c.type === 'nest'
                ? c.nest.name
                : `${c.participant.first_name} ${c.participant.last_name}`;
            return name.toLowerCase().includes(q);
        });
    }, [conversations, searchQuery]);

    const totalUnread = useMemo(
        () => conversations.reduce((sum, c) => sum + c.unread_count, 0),
        [conversations]
    );

    useEffect(() => {
        if (activeConversation) {
            setMessages(generateMockMessages(activeConversation.id));
        }
    }, [activeConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (text) => {
        const newMsg = {
            id: `m-${Date.now()}`,
            text,
            sender_id: 'me',
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
    };

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setShowMobileList(false);
    };

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
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
                            <p className="text-xs text-slate-400">
                                {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up'}
                            </p>
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-primary text-xl">edit_square</span>
                    </button>
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden min-h-0">
                    {/* Conversation List */}
                    <div className={`
                        w-full lg:w-80 xl:w-96 border-r border-slate-100 flex flex-col
                        ${!showMobileList ? 'hidden lg:flex' : 'flex'}
                    `}>
                        {/* Search */}
                        <div className="p-3 border-b border-slate-100">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length > 0 ? (
                                filteredConversations.map((conv) => (
                                    <ConversationItem
                                        key={conv.id}
                                        conversation={conv}
                                        isActive={activeConversation?.id === conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                    />
                                ))
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">search_off</span>
                                    <p className="text-sm text-slate-400">No conversations found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className={`
                        flex-1 flex flex-col min-w-0
                        ${showMobileList ? 'hidden lg:flex' : 'flex'}
                    `}>
                        {activeConversation ? (
                            <>
                                <ChatHeader
                                    conversation={activeConversation}
                                    onBack={() => setShowMobileList(true)}
                                />

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-white">
                                    {/* Date separator */}
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="flex-1 h-px bg-slate-200/60" />
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Today</span>
                                        <div className="flex-1 h-px bg-slate-200/60" />
                                    </div>

                                    {messages.map((msg, idx) => {
                                        const isOwn = msg.sender_id === 'me';
                                        const prevMsg = messages[idx - 1];
                                        const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                                        return (
                                            <MessageBubble
                                                key={msg.id}
                                                message={msg}
                                                isOwn={isOwn}
                                                showAvatar={showAvatar}
                                                senderName={activeConversation.participant.first_name}
                                            />
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <MessageInput onSend={handleSendMessage} />
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50/30 to-white">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center px-6"
                                >
                                    <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-5xl text-primary/40">forum</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">Your Messages</h3>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                                        Select a conversation to start messaging. Connect with your {user?.role === 'eagle' ? 'mentees' : 'mentor'} and peers.
                                    </p>
                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        <span>Real-time messaging coming soon with WebSocket support</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChatPage;
