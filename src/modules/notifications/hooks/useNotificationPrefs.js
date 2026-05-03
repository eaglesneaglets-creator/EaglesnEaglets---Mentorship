import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@shared/components/ui/toast-utils';
import NotificationsPrefsService from '../services/notifications-prefs-service';

export const notificationPrefsKeys = {
  all: ['notification-prefs'],
};

export const useNotificationPrefs = () =>
  useQuery({
    queryKey: notificationPrefsKeys.all,
    queryFn: () => NotificationsPrefsService.list(),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateNotificationPrefs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (preferences) => NotificationsPrefsService.update(preferences),
    onSuccess: (res) => {
      qc.setQueryData(notificationPrefsKeys.all, res);
      toast.success('Preferences updated');
    },
    onError: (err) => {
      const msg = err?.response?.data?.error?.message
        || err?.response?.data?.preferences?.[0]?.event_type?.[0]
        || 'Failed to update preferences';
      toast.error(msg);
    },
  });
};
