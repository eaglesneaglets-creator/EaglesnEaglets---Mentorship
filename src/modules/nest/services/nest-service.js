import { apiClient } from '@api';

/**
 * Nest Service — all nest-related API calls
 * Uses the project's fetch-based apiClient (returns parsed JSON directly).
 */
export const NestService = {
    // ------------------------------------------------------------------
    // Nests
    // ------------------------------------------------------------------

    getNests: (params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/${query}`);
    },

    getNest: (id) => apiClient.get(`/nests/${id}/`),

    createNest: (data) => apiClient.post('/nests/', data),

    updateNest: (id, data) => apiClient.patch(`/nests/${id}/`, data),

    getMyNests: () => apiClient.get('/nests/my/'),

    // ------------------------------------------------------------------
    // Memberships
    // ------------------------------------------------------------------

    getMembers: (nestId, params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/${nestId}/members/${query}`);
    },

    removeMember: (nestId, memberId) =>
        apiClient.delete(`/nests/${nestId}/members/${memberId}/`),

    // ------------------------------------------------------------------
    // Requests
    // ------------------------------------------------------------------

    getMyRequests: (params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/my-requests/${query}`);
    },

    getRequests: (nestId, params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/${nestId}/requests/${query}`);
    },

    requestToJoin: (nestId, message) =>
        apiClient.post(`/nests/${nestId}/requests/`, { message }),

    updateRequestStatus: (nestId, requestId, status) =>
        apiClient.patch(`/nests/${nestId}/requests/${requestId}/`, { action: status }),

    // ------------------------------------------------------------------
    // Posts & Community
    // ------------------------------------------------------------------

    getPosts: (nestId, params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/${nestId}/posts/${query}`);
    },

    createPost: (nestId, data) =>
        apiClient.post(`/nests/${nestId}/posts/`, data),

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------

    getEvents: (nestId, params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/${nestId}/events/${query}`);
    },
};
