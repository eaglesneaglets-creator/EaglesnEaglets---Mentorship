import { apiClient } from '@api';

const NotificationsPrefsService = {
  list: () => apiClient.get('/notifications/preferences/'),
  update: (preferences) => apiClient.patch('/notifications/preferences/', { preferences }),
};

export default NotificationsPrefsService;
