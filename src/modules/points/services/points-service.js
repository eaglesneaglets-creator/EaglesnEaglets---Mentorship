import { apiClient } from '@api';

const PointsService = {
    // --- Points & Summary ---
    getMyPoints: () => apiClient.get('/points/my/'),
    getTransactions: (params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/points/transactions/${query}`);
    },

    // --- Leaderboard ---
    getLeaderboard: (params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/points/leaderboard/${query}`);
    },

    // --- Badges ---
    getBadges: (params) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return apiClient.get(`/points/badges/${query}`);
    },
    getBadgeDetail: (id) => apiClient.get(`/points/badges/${id}/`),
    getMyBadges: () => apiClient.get('/points/badges/my/'),

    // --- Manual Awarding (Eagle Only) ---
    awardManualPoints: (data) => apiClient.post('/points/award/', data),

    // --- Eaglets by Nest (for award modal dropdown) ---
    getEagletsByNest: (nestId) => apiClient.get(`/nests/${nestId}/eaglets/`),

    // --- Admin Configuration ---
    getPointConfig: () => apiClient.get('/points/config/'),
    updatePointConfig: (id, data) => apiClient.patch(`/points/config/${id}/`, data),
};

export default PointsService;
