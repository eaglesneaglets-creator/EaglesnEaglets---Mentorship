import PropTypes from 'prop-types';
import { ChevronsUpDown, CircleHelp, Compass, Globe, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';

const ROLE_LABEL = { admin: 'Administrator', eagle: 'Mentor', eaglet: 'Mentee' };

/**
 * UserMenu — the account menu in the sidebar footer (shadcn DropdownMenu).
 *
 * Every signed-in user gets: account settings, help, the guided tour, the
 * public website, and log out. Users who hold two roles (mentor or mentee
 * plus platform admin) also get a "Switch view" radio group.
 *
 * Radix supplies focus management, typeahead, Escape/outside-click close and
 * the menu/menuitemradio semantics, so the current view is announced as
 * "checked" rather than shown only as a tick icon.
 */
export default function UserMenu({
  user,
  roleLabel,
  modes,
  currentMode,
  onPickMode,
  onNavigate,
  onStartTour,
  onLogout,
  collapsed = false,
  side = 'top',
  align = 'start',
  triggerClassName,
}) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your account';
  const label = roleLabel || ROLE_LABEL[user?.role] || 'Member';
  const isAdminView = currentMode === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {collapsed ? (
          <button
            type="button"
            aria-label="Account and role menu"
            className={cn(
              'grid size-10 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring',
              triggerClassName,
            )}
          >
            <Avatar user={user} size="sm" eager className="!rounded-lg" />
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition-colors',
              'hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring',
              // Icon-rail sidebar: avatar only.
              'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0',
              triggerClassName,
            )}
          >
            <Avatar user={user} size="sm" eager className="!rounded-lg" />
            <span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-foreground">{fullName}</span>
              <span
                className={cn(
                  'mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-px text-[11px] font-semibold',
                  isAdminView ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800',
                )}
              >
                {label}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" aria-hidden="true" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side={side} align={align} sideOffset={8} className="w-64">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-semibold text-foreground">{fullName}</span>
          {user?.email && <span className="block truncate text-xs text-muted-foreground">{user.email}</span>}
        </DropdownMenuLabel>

        {modes?.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Switch view</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={currentMode}>
              {modes.map((mode) => (
                <DropdownMenuRadioItem
                  key={mode.value}
                  value={mode.value}
                  onSelect={() => onPickMode?.(mode)}
                  className="items-start py-2"
                >
                  <Icon
                    name={mode.icon}
                    className={cn('mt-0.5 text-base', mode.value === 'admin' ? 'text-amber-700' : 'text-emerald-700')}
                  />
                  <span className="grid leading-tight">
                    <span className="text-sm font-medium">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">{mode.description}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onNavigate?.('/settings/account')}>
            <Settings aria-hidden="true" /> Account settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onNavigate?.('/faq')}>
            <CircleHelp aria-hidden="true" /> Help &amp; FAQs
          </DropdownMenuItem>
          {onStartTour && (
            <DropdownMenuItem onSelect={() => onStartTour()}>
              <Compass aria-hidden="true" /> Take the tour
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => onNavigate?.('/')}>
            <Globe aria-hidden="true" /> Visit website
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onLogout?.()}>
          <LogOut aria-hidden="true" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

UserMenu.propTypes = {
  user: PropTypes.object,
  /** Overrides the role pill text (e.g. "Administrator" while in admin view). */
  roleLabel: PropTypes.string,
  /** View modes for dual-role users; omit for single-role users. */
  modes: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.string,
    home: PropTypes.string,
  })),
  currentMode: PropTypes.string,
  onPickMode: PropTypes.func,
  onNavigate: PropTypes.func,
  onStartTour: PropTypes.func,
  onLogout: PropTypes.func,
  collapsed: PropTypes.bool,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  align: PropTypes.oneOf(['start', 'center', 'end']),
  triggerClassName: PropTypes.string,
};
