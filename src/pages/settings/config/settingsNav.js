export const SETTINGS_SECTIONS = [
  {
    id: 'account',
    path: 'account',
    label: 'Account',
    icon: 'person',
    roles: ['eagle', 'eaglet', 'admin'],
  },
  {
    id: 'notifications',
    path: 'notifications',
    label: 'Notifications',
    icon: 'notifications',
    roles: ['eagle', 'eaglet', 'admin'],
  },
  {
    id: 'privacy',
    path: 'privacy',
    label: 'Privacy',
    icon: 'lock',
    roles: ['eagle', 'eaglet', 'admin'],
  },
  {
    id: 'admin-points',
    path: 'admin/points',
    label: 'Points Config',
    icon: 'workspace_premium',
    roles: ['admin'],
  },
  {
    id: 'admin-platform',
    path: 'admin/platform',
    label: 'Platform',
    icon: 'tune',
    roles: ['admin'],
  },
];

export const sectionsForRole = (role) =>
  SETTINGS_SECTIONS.filter((section) => section.roles.includes(role));

export const defaultSectionForRole = (role) => {
  if (role === 'admin') return 'admin/platform';
  return 'account';
};
