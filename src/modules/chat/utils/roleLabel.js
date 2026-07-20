/**
 * chatRoleLabel — human label for a chat participant's role.
 *
 * Order matters: a stacked mentor-admin keeps role='eagle' but carries
 * is_platform_staff/is_superuser, so we check the admin flags BEFORE the
 * eagle/eaglet fallback. A pure admin has role='admin'.
 *
 *   superuser / platform-staff → 'Admin'
 *   role 'admin'               → 'Admin'
 *   role 'eagle'               → 'Mentor'
 *   otherwise                  → 'Mentee'
 */
export function chatRoleLabel(user) {
  if (!user) return '';
  if (user.is_superuser || user.is_platform_staff || user.role === 'admin') {
    return 'Admin';
  }
  if (user.role === 'eagle') return 'Mentor';
  return 'Mentee';
}

export default chatRoleLabel;
