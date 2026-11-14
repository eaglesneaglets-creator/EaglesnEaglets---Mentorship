import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Icon from '../ui/Icon';
import { formatRelativeTime } from '../../utils';

const TYPE_META = {
  mentorship_request: { icon: 'person_add', tone: 'bg-sky-50 text-sky-700' },
  mentorship_approved: { icon: 'check_circle', tone: 'bg-emerald-50 text-emerald-700' },
  mentorship_rejected: { icon: 'cancel', tone: 'bg-red-50 text-red-700' },
  content_published: { icon: 'library_books', tone: 'bg-violet-50 text-violet-700' },
  points_awarded: { icon: 'stars', tone: 'bg-amber-50 text-amber-800' },
  badge_earned: { icon: 'military_tech', tone: 'bg-amber-50 text-amber-800' },
  nest_post: { icon: 'forum', tone: 'bg-teal-50 text-teal-700' },
  assignment_graded: { icon: 'grading', tone: 'bg-indigo-50 text-indigo-700' },
  post_like: { icon: 'favorite', tone: 'bg-rose-50 text-rose-700' },
  post_comment: { icon: 'chat_bubble', tone: 'bg-sky-50 text-sky-700' },
  general: { icon: 'notifications', tone: 'bg-stone-100 text-stone-700' },
};

/**
 * NotificationsMenu — header bell + popover (shadcn Popover + ScrollArea).
 * Replaces the hand-built dropdown with outside-click listeners; Radix
 * handles focus, Escape and dismissal, and each notification is a real button.
 */
export default function NotificationsMenu({
  open,
  onOpenChange,
  notifications,
  unreadCount,
  onSelect,
  onMarkAllRead,
  markingAll,
  shaking,
}) {
  const shown = notifications.slice(0, 8);
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications';

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-10" aria-label={label} data-tour="notifications">
          <Bell className={cn('size-5', shaking && 'animate-wiggle')} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(24rem,calc(100vw-1.5rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onMarkAllRead} disabled={markingAll}>
              Mark all as read
            </Button>
          )}
        </div>

        {shown.length > 0 ? (
          <ScrollArea className="max-h-96">
            <ul className="divide-y">
              {shown.map((n) => {
                const meta = TYPE_META[n.notification_type] || TYPE_META.general;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(n)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                        !n.is_read && 'bg-emerald-50/50',
                      )}
                    >
                      <span className={cn('grid size-8 shrink-0 place-items-center rounded-md', meta.tone)}>
                        <Icon name={meta.icon} className="text-sm" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm text-foreground', !n.is_read ? 'font-semibold' : 'font-medium')}>
                          {n.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{n.message}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                          {formatRelativeTime(n.created_at)}
                        </span>
                        {!n.is_read && <span className="size-2 rounded-full bg-emerald-600" aria-label="Unread" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <BellOff className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">You&rsquo;re all caught up</p>
            <p className="text-xs text-muted-foreground">
              Updates from your nest, mentors and assignments will show up here.
            </p>
          </div>
        )}

        <div className="border-t p-1">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/notifications" onClick={() => onOpenChange(false)}>View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

NotificationsMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  notifications: PropTypes.array.isRequired,
  unreadCount: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onMarkAllRead: PropTypes.func.isRequired,
  markingAll: PropTypes.bool,
  shaking: PropTypes.bool,
};
