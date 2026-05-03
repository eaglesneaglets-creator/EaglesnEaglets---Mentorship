import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@store';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import {
    useConversations,
    useMessages,
    useChatSocket,
    useMarkRead,
    useCreateDM,
} from '../../modules/chat/hooks/useChat';
import { ConnectionBadge, ConversationSkeleton } from './components/_shared';
import ConversationItem from './components/ConversationItem';
import MessageBubble from './components/MessageBubble';
import ChatHeader from './components/ChatHeader';
import MessageInput from './components/MessageInput';
import NewChatDropdown from './components/NewChatDropdown';

const ChatPage = () => {
    const { user } = useAuthStore();
    const [activeConversation, setActiveConversation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileList, setShowMobileList] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef(null);
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
    const {
        data: msgsData,
        isLoading: msgsLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = useMessages(activeConversation?.id, { enabled: !!activeConversation });
    const messages = useMemo(() => msgsData?.messages ?? [], [msgsData?.messages]);
    const hasMoreMessages = msgsData?.hasMore ?? false;
    const { status: wsStatus, sendMessage } = useChatSocket(activeConversation?.id);
    const markReadMutation = useMarkRead();
    const createDMMutation = useCreateDM();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (activeConversation?.id) {
            markReadMutation.mutate(activeConversation.id);
        }
    }, [activeConversation?.id, markReadMutation]);

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
                                    {!msgsLoading && hasMoreMessages && (
                                        <div className="flex justify-center pb-2">
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="text-xs font-medium text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isFetchingNextPage ? (
                                                    <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin inline-block" />
                                                ) : null}
                                                Load older messages
                                            </button>
                                        </div>
                                    )}
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
