import PropTypes from 'prop-types';
import { navMenuBtnClass, navMenuIconClass } from './publicNavConfig';

export const MOBILE_NAV_DRAWER_ID = 'floating-navbar-mobile-drawer';

export default function FloatingNavbarMenuButton({
  mobileOpen,
  onToggle,
  useDarkText,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={navMenuBtnClass(useDarkText)}
      aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={mobileOpen}
      aria-controls={MOBILE_NAV_DRAWER_ID}
    >
      <span className={`${navMenuIconClass(useDarkText)} transition-transform duration-200 ${mobileOpen ? 'rotate-90' : ''}`}>
        {mobileOpen ? 'close' : 'menu'}
      </span>
    </button>
  );
}

FloatingNavbarMenuButton.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  useDarkText: PropTypes.bool.isRequired,
};
