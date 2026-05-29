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

    // Audience-specific listings. Names match the BE endpoints so the
    // intent is unambiguous (avoids the old /nests/my/ ambiguity where
    // mentors and mentees called the same URL expecting different data).
    getJoinedNests: () => apiClient.get('/nests/joined/'), // eaglet POV
    getOwnedNests: () => apiClient.get('/nests/owned/'),   // mentor POV

    /** @deprecated Use getJoinedNests() (eaglet) or getOwnedNests() (mentor). */
    getMyNests: () => apiClient.get('/nests/joined/'),

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

    // Plan 14.5 follow-up: legacy /nests/my-requests/ returned MentorshipRequest
    // rows; new ProgramEnrollment flow lives under /program-enrollments/my-requests/
    getMyRequests: (params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/program-enrollments/my-requests/${query}`);
    },

    getRequests: (nestId, params = {}) => {
        const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/nests/${nestId}/requests/${query}`);
    },

    requestToJoin: (nestId, message) =>
        apiClient.post(`/nests/${nestId}/requests/`, { message }),

    // Plan 14.5-02: new ProgramEnrollment-aware join. Replaces requestToJoin
    // for mentees joining via the Nest discovery flow. Hits the
    // /enroll/ endpoint added in Phase 14-02 which creates a pending
    // ProgramEnrollment instead of a legacy MentorshipRequest.
    enrollInNest: (nestId, message) =>
        apiClient.post(`/nests/${nestId}/enroll/`, { message }),

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
