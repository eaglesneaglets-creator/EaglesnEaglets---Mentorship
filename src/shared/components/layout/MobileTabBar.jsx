import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import Icon from '../ui/Icon';
import { isNavItemActive } from './app-nav';

const SHORT_LABEL = { Dashboard: 'Home', 'User Management': 'People', 'Grading': 'Grading' };

/**
 * MobileTabBar — thumb-reach primary navigation below lg (iOS-style).
 * "More" opens the full sidebar as a sheet.
 */
export default function MobileTabBar({ items, lockedFeatures, isMentee, onLockedClick }) {
  const { pathname } = useLocation();
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <nav
      className="ios-mobile-tabbar lg:hidden"
      aria-label="Primary navigation"
      aria-hidden={openMobile || undefined}
      inert={openMobile}
    >
      {items.map((item) => {
        const locked = Boolean(isMentee && item.featureKey && lockedFeatures.includes(item.featureKey));
        const active = isNavItemActive(item, pathname);
        return (
          <Link
            key={item.to}
            to={locked ? '#' : item.to}
            data-tour={item.tour ? `tab-${item.tour}` : undefined}
            aria-current={active ? 'page' : undefined}
            aria-disabled={locked || undefined}
            className={active ? 'is-active' : ''}
            onClick={(event) => {
              if (locked) {
                event.preventDefault();
                onLockedClick?.(item.featureKey);
              }
            }}
          >
            <span className="ios-tab-icon">
              <Icon name={item.icon} />
              {item.badge && !locked && <i>{Number(item.badge) > 9 ? '9+' : item.badge}</i>}
              {locked && <i className="is-lock"><Icon name="lock" /></i>}
            </span>
            <small>{SHORT_LABEL[item.label] || item.label}</small>
          </Link>
        );
      })}
      <button type="button" data-tour="tab-more" onClick={() => setOpenMobile(true)} aria-label="More navigation">
        <span className="ios-tab-icon"><Icon name="apps" /></span>
        <small>More</small>
      </button>
    </nav>
  );
}

MobileTabBar.propTypes = {
  items: PropTypes.array.isRequired,
  lockedFeatures: PropTypes.arrayOf(PropTypes.string).isRequired,
  isMentee: PropTypes.bool,
  onLockedClick: PropTypes.func,
};
