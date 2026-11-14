import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Icon from '../ui/Icon';
import { SETTINGS_ITEM, isNavItemActive } from './app-nav';

const LOGO = '/logo.webp';

function NavLink({ item, locked, active, onLockedClick }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const badge = item.badge && !locked ? (Number(item.badge) > 99 ? '99+' : item.badge) : null;
  return (
    <SidebarMenuItem data-tour={item.tour ? `nav-${item.tour}` : undefined}>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={locked ? `${item.label} (locked)` : item.label}
        className="h-9 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary/90 data-[active=true]:hover:text-sidebar-primary-foreground"
      >
        <Link
          to={locked ? '#' : item.to}
          aria-current={active ? 'page' : undefined}
          aria-disabled={locked || undefined}
          onClick={(event) => {
            if (locked) {
              event.preventDefault();
              onLockedClick?.(item.featureKey);
              return;
            }
            if (isMobile) setOpenMobile(false);
          }}
          className={cn(locked && 'text-muted-foreground')}
        >
          <Icon name={item.icon} className="text-base" />
          <span>{item.label}</span>
          {locked && <Lock className="ml-auto size-3.5 opacity-70" aria-label="Locked" />}
        </Link>
      </SidebarMenuButton>
      {badge && (
        <SidebarMenuBadge
          className={cn(
            'rounded-full bg-emerald-700 px-1.5 text-white peer-data-[active=true]/menu-button:bg-white peer-data-[active=true]/menu-button:text-emerald-800',
          )}
          aria-label={`${badge} unread`}
        >
          {badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

NavLink.propTypes = {
  item: PropTypes.object.isRequired,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  onLockedClick: PropTypes.func,
};

/**
 * AppSidebar — the authenticated app's navigation (shadcn Sidebar).
 * Desktop: full width or icon rail (⌘/Ctrl+B, or click the rail).
 * Below lg: an off-canvas sheet opened from the header or the tab bar.
 */
export default function AppSidebar({ groups, lockedFeatures, isMentee, adminView, userMenu, onLockedClick }) {
  const { pathname } = useLocation();
  const isLocked = (item) => Boolean(isMentee && item.featureKey && lockedFeatures.includes(item.featureKey));

  return (
    <Sidebar collapsible="icon" data-tour="sidebar" aria-label="App navigation">
      {adminView && <div aria-hidden className="h-0.5 w-full shrink-0 bg-amber-400" />}
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Eagles & Eaglets home"
        >
          <img src={LOGO} alt="" className="size-8 shrink-0 rounded-lg" />
          <span className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-foreground">Eagles &amp; Eaglets</span>
            <span className="truncate text-xs text-muted-foreground">
              {adminView ? 'Admin console' : 'Mentorship'}
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={group.label || `group-${index}`} className={index === 0 ? 'pt-3' : undefined}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    item={item}
                    locked={isLocked(item)}
                    active={isNavItemActive(item, pathname)}
                    onLockedClick={onLockedClick}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <NavLink item={SETTINGS_ITEM} active={isNavItemActive(SETTINGS_ITEM, pathname)} />
          <SidebarMenuItem data-tour="user-menu" className="mt-1">
            {userMenu}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

AppSidebar.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, items: PropTypes.array })).isRequired,
  lockedFeatures: PropTypes.arrayOf(PropTypes.string).isRequired,
  isMentee: PropTypes.bool,
  adminView: PropTypes.bool,
  userMenu: PropTypes.node,
  onLockedClick: PropTypes.func,
};
