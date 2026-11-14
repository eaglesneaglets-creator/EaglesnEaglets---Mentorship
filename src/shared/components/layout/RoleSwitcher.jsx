/**
 * RoleSwitcher — account menu for dual-role users (mentor or mentee who is
 * also a platform admin). Thin wrapper over UserMenu (shadcn DropdownMenu)
 * that supplies the two views and wires them to the store.
 */

import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useCurrentMode, useSetCurrentMode } from '@store';
import UserMenu from './UserMenu';

const ADMIN_MODE = {
  value: 'admin',
  label: 'Administrator',
  description: 'Manage platform & members',
  icon: 'shield_person',
  home: '/admin/dashboard',
};
const MENTOR_MODE = {
  value: 'mentor',
  label: 'Mentor',
  description: 'Lead your Nest',
  icon: 'workspaces',
  home: '/dashboard',
};
const MENTEE_MODE = {
  value: 'mentee',
  label: 'Mentee',
  description: 'Continue your learning',
  icon: 'school',
  home: '/dashboard',
};

// Plan 22-02: stacked role pair depends on user's base role.
const modesForRole = (role) =>
  role === 'eaglet' ? [ADMIN_MODE, MENTEE_MODE] : [ADMIN_MODE, MENTOR_MODE];

export default function RoleSwitcher({
  user,
  onClose,
  onLogout,
  onStartTour,
  variant = 'expanded', // 'expanded' | 'collapsed' (icon-only trigger)
  side,
  align,
}) {
  const navigate = useNavigate();
  const currentMode = useCurrentMode();
  const setCurrentMode = useSetCurrentMode();

  const currentLabel =
    currentMode === 'admin' ? 'Administrator' : user?.role === 'eaglet' ? 'Mentee' : 'Mentor';

  const go = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <UserMenu
      user={user}
      roleLabel={currentLabel}
      modes={modesForRole(user?.role)}
      currentMode={currentMode}
      onPickMode={(mode) => {
        if (mode.value !== currentMode) setCurrentMode(mode.value);
        go(mode.home);
      }}
      onNavigate={go}
      onStartTour={onStartTour}
      onLogout={onLogout}
      collapsed={variant === 'collapsed'}
      side={side}
      align={align}
    />
  );
}

RoleSwitcher.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func,
  onLogout: PropTypes.func,
  onStartTour: PropTypes.func,
  variant: PropTypes.oneOf(['expanded', 'collapsed']),
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  align: PropTypes.oneOf(['start', 'center', 'end']),
};
