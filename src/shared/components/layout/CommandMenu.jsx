import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bell, CircleHelp, Compass, LogOut, Search, Settings } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import Icon from '../ui/Icon';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Header button that opens the palette; looks like a search field. */
export function CommandMenuTrigger({ onOpen, className }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-tour="search"
      className={cn(
        'inline-flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors',
        'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-left">Search pages and actions…</span>
      <KbdGroup className="hidden sm:inline-flex" aria-hidden="true">
        <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  );
}

CommandMenuTrigger.propTypes = { onOpen: PropTypes.func.isRequired, className: PropTypes.string };

/**
 * CommandMenu — ⌘K / Ctrl+K palette (shadcn Command + cmdk).
 * The header previously showed a "Search..." input that did nothing; this
 * gives keyboard users a real way to reach every page and common action.
 */
export default function CommandMenu({ open, onOpenChange, groups, lockedFeatures = [], isMentee, onNavigate, onStartTour, onLogout }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const run = (fn) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Eagles & Eaglets"
      description="Jump to a page or run an action"
    >
      <CommandInput placeholder="Type a page or action…" />
      <CommandList>
        <CommandEmpty>No matches. Try “messages” or “settings”.</CommandEmpty>
        {groups.map((group, index) => (
          <CommandGroup key={group.label || `g-${index}`} heading={group.label || 'Go to'}>
            {group.items.map((item) => {
              const locked = Boolean(isMentee && item.featureKey && lockedFeatures.includes(item.featureKey));
              return (
                <CommandItem
                  key={item.to}
                  value={`${item.label} ${group.label || ''}`}
                  disabled={locked}
                  onSelect={() => run(() => onNavigate(item.to))}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {locked && <span className="ml-auto text-xs text-muted-foreground">Locked</span>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem value="Notifications" onSelect={() => run(() => onNavigate('/notifications'))}>
            <Bell aria-hidden="true" /> Notifications
          </CommandItem>
          <CommandItem value="Settings account profile" onSelect={() => run(() => onNavigate('/settings'))}>
            <Settings aria-hidden="true" /> Settings
          </CommandItem>
          <CommandItem value="Help FAQs support" onSelect={() => run(() => onNavigate('/faq'))}>
            <CircleHelp aria-hidden="true" /> Help &amp; FAQs
          </CommandItem>
          {onStartTour && (
            <CommandItem value="Take the tour walkthrough guide" onSelect={() => run(onStartTour)}>
              <Compass aria-hidden="true" /> Take the tour
            </CommandItem>
          )}
          <CommandItem value="Log out sign out" onSelect={() => run(onLogout)}>
            <LogOut aria-hidden="true" /> Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

CommandMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired,
  lockedFeatures: PropTypes.arrayOf(PropTypes.string),
  isMentee: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
  onStartTour: PropTypes.func,
  onLogout: PropTypes.func.isRequired,
};
