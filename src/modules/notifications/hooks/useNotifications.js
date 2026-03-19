import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationService from '../services/notification-service';

export const notificationKeys = {
    all: ['notifications'],
    list: () => [...notificationKeys.all, 'list'],
    unread: () => [...notificationKeys.all, 'unread'],
};

export const useNotifications = (params) => {
    return useQuery({
        queryKey: [...notificationKeys.list(), params],
        queryFn: () => NotificationService.getNotifications(params),
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: () => NotificationService.getUnreadCount(),
        refetchInterval: 30000, // Poll every 30s for new notifications
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => NotificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => NotificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};
