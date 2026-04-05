import { useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ChatService from '../services/chat-service';
import { useWebSocket } from '@hooks/useWebSocket';

export const chatKeys = {
    all: ['chat'],
    conversations: () => [...chatKeys.all, 'conversations'],
    messages: (convId) => [...chatKeys.all, 'messages', convId],
    nestConversation: (nestId) => [...chatKeys.all, 'nest', nestId],
    contacts: () => [...chatKeys.all, 'contacts'],
};

// --- REST Hooks ---

export const useConversations = ({ enabled = true } = {}) =>
    useQuery({
        queryKey: chatKeys.conversations(),
        queryFn: () => ChatService.getConversations(),
        select: (data) => data?.data || [],
        staleTime: 30 * 1000,
        enabled,
    });

/**
 * useTotalUnread — lightweight hook to get total unread message count
 * across all conversations. Used by sidebar badge.
 */
export const useTotalUnread = ({ enabled = true } = {}) => {
    const { data: conversations = [] } = useConversations({ enabled });
    return conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
};

export const useContacts = () =>
    useQuery({
        queryKey: chatKeys.contacts(),
        queryFn: () => ChatService.getContacts(),
        select: (data) => data?.data || [],
        staleTime: 60 * 1000,
    });

export const useMessages = (conversationId, { enabled = true } = {}) =>
    useInfiniteQuery({
        queryKey: chatKeys.messages(conversationId),
        queryFn: ({ pageParam }) => ChatService.getMessages(conversationId, pageParam),
        initialPageParam: null,
        // Cursor = oldest message ID in the last fetched page; undefined stops loading
        getNextPageParam: (lastPage) => {
            const msgs = lastPage?.data ?? [];
            return msgs.length >= 50 ? (msgs[0]?.id ?? undefined) : undefined;
        },
        select: (data) => ({
            // Reverse so oldest page renders first (chronological order)
            messages: data.pages.slice().reverse().flatMap((p) => p?.data ?? []),
            hasMore: (data.pages.at(-1)?.data?.length ?? 0) >= 50,
        }),
        enabled: !!conversationId && enabled,
        staleTime: 0, // always fresh — WS keeps it updated
    });

export const useNestConversation = (nestId) =>
    useQuery({
        queryKey: chatKeys.nestConversation(nestId),
        queryFn: () => ChatService.getNestConversation(nestId),
        select: (data) => data?.data,
        enabled: !!nestId,
    });

export const useCreateDM = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => ChatService.createDM(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to start conversation');
        },
    });
};

export const useMarkRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (conversationId) => ChatService.markRead(conversationId),
        onSuccess: () => {
            // Refresh conversations to update unread counts in sidebar
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
    });
};

// --- WebSocket Hook ---

/**
 * useChatSocket — connects to the chat WS for a specific conversation.
 * Incoming messages are appended directly to the React Query cache
 * so MessageBubbles re-render without a network refetch.
 */
export const useChatSocket = (conversationId, { enabled = true } = {}) => {
    const queryClient = useQueryClient();

    const onMessage = useCallback((data) => {
        if (data.type !== 'chat.message') return;

        queryClient.setQueryData(chatKeys.messages(conversationId), (old) => {
            // useInfiniteQuery cache shape: { pages: [...], pageParams: [...] }
            // New messages append to pages[0] (the most recent page).
            if (!old?.pages?.length) return old;
            const latestPage = old.pages[0];
            const existing = latestPage?.data ?? [];
            if (existing.some((m) => m.id === data.id)) return old;
            const newMsg = {
                id: data.id,
                conversation: data.conversation,
                sender: { id: data.sender_id, full_name: data.sender_name },
                sender_id: data.sender_id,
                content: data.content,
                is_deleted: false,
                created_at: data.created_at,
            };
            const updatedPage = { ...latestPage, data: [...existing, newMsg] };
            return { ...old, pages: [updatedPage, ...old.pages.slice(1)] };
        });

        // Also update last_message in conversations list.
        // useConversations also uses select: (data) => data?.data || []
        // so we must keep the cache in the { data: [...] } envelope shape.
        queryClient.setQueryData(chatKeys.conversations(), (old) => {
            if (!old) return old;
            const convList = old?.data ?? (Array.isArray(old) ? old : []);
            const updated = convList.map((conv) =>
                conv.id === data.conversation
                    ? {
                          ...conv,
                          last_message: {
                              content: data.content,
                              sender_id: data.sender_id,
                              created_at: data.created_at,
                          },
                      }
                    : conv
            );
            return { ...(old || {}), data: updated };
        });
    }, [conversationId, queryClient]);

    const path = conversationId ? `ws/chat/${conversationId}/` : null;

    const { status, send } = useWebSocket({
        path,
        onMessage,
        enabled: !!conversationId && enabled,
    });

    const sendMessage = useCallback((content) => {
        send({ type: 'chat.message', content });
    }, [send]);

    const sendReadReceipt = useCallback(() => {
        send({ type: 'chat.read' });
    }, [send]);

    return { status, sendMessage, sendReadReceipt };
};
