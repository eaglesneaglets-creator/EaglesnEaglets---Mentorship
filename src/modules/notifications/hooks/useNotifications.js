import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import NotificationService from '../services/notification-service';
import { useWebSocket } from '@hooks/useWebSocket';
import { useAuthStore } from '@store';

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
        // Removed refetchInterval: 30000 — WebSocket push replaces polling
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

/**
 * useNotificationSocket — connects to ws/notifications/ and handles incoming push notifications.
 *
 * On each push:
 *   1. Increments unread count in React Query cache (instant badge update)
 *   2. Invalidates notifications list so it refetches on next open
 *   3. Shows a toast
 *
 * Mount this ONCE in DashboardLayout.
 */
export const useNotificationSocket = () => {
    const queryClient = useQueryClient();
    const { user, accessToken } = useAuthStore();

    const onMessage = useCallback((data) => {
        // Only handle messages with a notification payload
        if (!data?.data?.title) return;

        const notification = data.data;

        // Update unread count in cache for instant badge update
        queryClient.setQueryData(notificationKeys.unread(), (old) => {
            if (!old) return old;
            const current = old?.data?.count ?? old?.data ?? 0;
            if (old?.data?.count !== undefined) {
                return { ...old, data: { ...old.data, count: current + 1 } };
            }
            return old;
        });

        // Invalidate list so it refetches on next open
        queryClient.invalidateQueries({ queryKey: notificationKeys.list() });

        // Real-time leaderboard update — invalidate when points are awarded
        if (notification.notification_type === 'points_awarded') {
            queryClient.invalidateQueries({ queryKey: ['points', 'leaderboard'] });
        }

        // Show toast notification
        toast(notification.title, {
            icon: '🔔',
            duration: 4000,
        });
    }, [queryClient]);

    const { status, retryCount } = useWebSocket({
        path: 'ws/notifications/',
        onMessage,
        token: accessToken,
        enabled: !!user && !!accessToken,
    });

    return { status, retryCount };
};
