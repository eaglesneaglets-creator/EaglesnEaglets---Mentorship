import PropTypes from 'prop-types';

/**
 * Sidebar Component
 * Main navigation sidebar for dashboard
 */
const Sidebar = ({ isOpen = true, children }) => {
  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200
        transition-all duration-300 z-40
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className={`font-bold text-xl text-blue-600 ${!isOpen && 'hidden'}`}>
            Eagles & Eaglets
          </h1>
          {!isOpen && <span className="text-2xl">🦅</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {children}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* User info or logout */}
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  children: PropTypes.node,
};

export default Sidebar;
