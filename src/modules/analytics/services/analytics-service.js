import { apiClient } from '@api';

const AnalyticsService = {
    getEagleDashboard: () => apiClient.get('/analytics/eagle-dashboard/'),
    getEagletDashboard: () => apiClient.get('/analytics/eaglet-dashboard/'),
    getAdminDashboard: () => apiClient.get('/analytics/admin-dashboard/'),
    getNestAnalytics: (nestId) => apiClient.get(`/analytics/nest/${nestId}/`),
    dailyCheckIn: () => apiClient.post('/analytics/check-in/', {}),
};

export default AnalyticsService;
