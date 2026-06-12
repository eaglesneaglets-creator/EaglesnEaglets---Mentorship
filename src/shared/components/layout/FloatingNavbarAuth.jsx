import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  getDashboardPath,
  getInitials,
  logoImg,
  navBrandTextClass,
  navLinkClass,
} from './publicNavConfig';

export function FloatingNavbarBrand({ useDarkText, compact = false }) {
  if (compact) {
    return (
      <Link to="/" className="flex items-center gap-2 min-w-0 flex-1 mr-1">
        <img src={logoImg} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-white/50" />
        <span className={`${navBrandTextClass(useDarkText)} truncate`}>
          <span className="hidden min-[420px]:inline">Eagles &amp; Eaglets</span>
          <span className="min-[420px]:hidden">E&amp;E</span>
        </span>
      </Link>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-2 pl-3 pr-4">
      <img src={logoImg} alt="Eagles & Eaglets" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50" />
      <span className={navBrandTextClass(useDarkText)}>Eagles & Eaglets</span>
    </Link>
  );
}

FloatingNavbarBrand.propTypes = {
  useDarkText: PropTypes.bool.isRequired,
  compact: PropTypes.bool,
};

export function FloatingNavbarLinks({ links, useDarkText }) {
  return links.map((link) => (
    <Link
      key={link.label}
      to={link.path}
      className={`${navLinkClass(useDarkText)} whitespace-nowrap`}
    >
      {link.label}
    </Link>
  ));
}

FloatingNavbarLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
  useDarkText: PropTypes.bool.isRequired,
};

export function FloatingNavbarGuestAuth({ useDarkText, linkClassName }) {
  const linkClass = linkClassName || navLinkClass(useDarkText);

  return (
    <>
      <Link to="/login" className={`${linkClass} whitespace-nowrap`}>Login</Link>
      <Link
        to="/register"
        className="px-4 lg:px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/25 whitespace-nowrap flex-shrink-0"
      >
        Join Now
      </Link>
    </>
  );
}

FloatingNavbarGuestAuth.propTypes = {
  useDarkText: PropTypes.bool.isRequired,
  linkClassName: PropTypes.string,
};

export function FloatingNavbarUserAvatar({ user, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-8 h-8 text-sm';

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.first_name || ''}
        className={`${dim} rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${dim} rounded-full bg-primary text-white font-bold flex items-center justify-center ring-2 ring-primary/30 flex-shrink-0`}>
      {getInitials(user)}
    </div>
  );
}

FloatingNavbarUserAvatar.propTypes = {
  user: PropTypes.object.isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
};

export function FloatingNavbarAuthDropdown({
  user,
  useDarkText,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onLogout,
  dashboardLabel,
  menuLinks,
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((open) => !open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/15 transition-colors focus:outline-none"
      >
        <FloatingNavbarUserAvatar user={user} />
        <span className={`text-sm font-semibold max-w-[90px] truncate transition-colors duration-500 ${
          useDarkText ? 'text-slate-700' : 'text-white'
        }`}>
          {user.first_name || user.email}
        </span>
        <span className={`material-symbols-outlined text-base transition-transform duration-200 ${
          dropdownOpen ? 'rotate-180' : ''
        } ${useDarkText ? 'text-slate-400' : 'text-white/70'}`}>
          expand_more
        </span>
      </button>

      <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden
        transition-all duration-200 origin-top-right
        ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
      >
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.first_name} {user.last_name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
          <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
            {user.role}
          </span>
        </div>
        <div className="py-1">
          <Link
            to={getDashboardPath(user)}
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-primary">dashboard</span>
            {dashboardLabel}
          </Link>
          {menuLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className={`material-symbols-outlined text-base ${link.iconClass || 'text-slate-500'}`}>
                {link.icon}
              </span>
              {link.label}
              {link.badge != null && link.badge > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div className="border-t border-slate-100 py-1">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

FloatingNavbarAuthDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  useDarkText: PropTypes.bool.isRequired,
  dropdownOpen: PropTypes.bool.isRequired,
  setDropdownOpen: PropTypes.func.isRequired,
  dropdownRef: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  dashboardLabel: PropTypes.string.isRequired,
  menuLinks: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      iconClass: PropTypes.string,
      badge: PropTypes.number,
    }),
  ).isRequired,
};
