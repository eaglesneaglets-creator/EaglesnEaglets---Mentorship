import { apiClient } from '@api';

const ChatService = {
    // --- Conversations ---
    getConversations: () => apiClient.get('/chat/conversations/'),

    createDM: (userId) =>
        apiClient.post('/chat/conversations/dm/', { user_id: userId }),

    // --- Messages ---
    getMessages: (conversationId, before = null) => {
        const query = before ? `?before=${before}` : '';
        return apiClient.get(`/chat/conversations/${conversationId}/messages/${query}`);
    },

    markRead: (conversationId) =>
        apiClient.post(`/chat/conversations/${conversationId}/read/`, {}),

    // --- Nest group ---
    getNestConversation: (nestId) =>
        apiClient.get(`/chat/nest/${nestId}/conversation/`),

    // --- Contacts ---
    getContacts: () => apiClient.get('/chat/contacts/'),
};

export default ChatService;
