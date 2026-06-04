import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardPath } from './publicNavConfig';
import { FloatingNavbarUserAvatar } from './FloatingNavbarAuth';

export default function FloatingNavbarMobileDrawer({
  mobileOpen,
  setMobileOpen,
  links,
  isAuthenticated,
  user,
  onLogout,
  dashboardLabel,
  authenticatedExtras = [],
}) {
  return (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl p-3 mx-4"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              {link.label}
              {link.badge != null && link.badge > 0 && (
                <span className="ml-2 text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="border-t border-slate-100 mt-2 pt-2">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Link
                  to={getDashboardPath(user)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-base text-primary">dashboard</span>
                  {dashboardLabel}
                </Link>
                {authenticatedExtras.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  >
                    {link.icon && (
                      <span className={`material-symbols-outlined text-base ${link.iconClass || 'text-primary'}`}>
                        {link.icon}
                      </span>
                    )}
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-600 rounded-xl border border-slate-200 hover:border-primary/30"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-md hover:bg-primary-dark"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

FloatingNavbarMobileDrawer.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  setMobileOpen: PropTypes.func.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      badge: PropTypes.number,
    }),
  ).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  dashboardLabel: PropTypes.string.isRequired,
  authenticatedExtras: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string,
      iconClass: PropTypes.string,
    }),
  ),
};
