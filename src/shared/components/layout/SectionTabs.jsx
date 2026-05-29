/**
 * SectionTabs — pill-style tab strip used to group related admin pages
 * under a single sidebar entry (Users + KYC, Team + Admin Requests,
 * Store + Orders).
 *
 * Usage:
 *   <SectionTabs
 *     tabs={[
 *       { label: 'Users', to: '/admin/users' },
 *       { label: 'KYC Reviews', to: '/admin/kyc', badge: pendingCount },
 *     ]}
 *   />
 *
 * Active tab is determined by route match (NavLink `end` prop). Mobile
 * gets horizontal scroll if the tabs overflow the viewport width.
 */

import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

export default function SectionTabs({ tabs, className = '' }) {
  return (
    <div className={`overflow-x-auto -mx-2 px-2 scrollbar-hide ${className}`}>
      <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-full">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end ?? true}
            className={({ isActive }) =>
              `relative whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`
            }
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full bg-emerald-500 text-white align-middle">
                {tab.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

SectionTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      badge: PropTypes.number,
      end: PropTypes.bool,
    }),
  ).isRequired,
  className: PropTypes.string,
};
