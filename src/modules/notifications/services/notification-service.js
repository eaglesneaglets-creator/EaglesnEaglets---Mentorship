import { apiClient } from '@api';

const NotificationService = {
    getNotifications: (params) => {
        const query = params?.unread ? '?unread=true' : '';
        return apiClient.get(`/notifications/${query}`);
    },
    getUnreadCount: () => apiClient.get('/notifications/unread/'),
    markAsRead: (id) => apiClient.patch(`/notifications/${id}/read/`),
    markAllAsRead: () => apiClient.post('/notifications/read-all/'),
};

export default NotificationService;
