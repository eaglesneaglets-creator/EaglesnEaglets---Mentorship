import { useNotificationPrefs, useUpdateNotificationPrefs } from '@modules/notifications/hooks/useNotificationPrefs';
import DomainPrefCard from './notifications/DomainPrefCard';

export default function NotificationsSection() {
  const { data, isLoading, isError, refetch } = useNotificationPrefs();
  const updateMutation = useUpdateNotificationPrefs();

  const domains = data?.data?.domains ?? [];

  const handleUpdate = (preferences) => {
    updateMutation.mutate(preferences);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose which events trigger emails or in-app alerts. Toggle a whole group, or open a group to fine-tune individual events.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>Could not load preferences.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 h-9 rounded-lg bg-white border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {domains.map((domain) => (
            <DomainPrefCard
              key={domain.key}
              domain={domain}
              onUpdate={handleUpdate}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
