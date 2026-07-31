/**
 * Initials + deterministic avatar colour (Phase 32-02).
 *
 * Lives outside Avatar.jsx because exporting non-component helpers from a
 * component file breaks React Fast Refresh (eslint react-refresh/only-export-components).
 *
 * This is the SINGLE implementation — 26 files previously hand-rolled their own
 * initials logic, which is why avatars looked different on different surfaces.
 */

export const AVATAR_COLORS = [
  'from-emerald-400 to-emerald-500',
  'from-blue-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-purple-400 to-violet-500',
  'from-cyan-400 to-teal-500',
];

/** Two initials from whatever name shape the caller has. '?' when unknown. */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

/**
 * Deterministic colour from the name — NOT the list index, so a person keeps the
 * same fallback colour on every surface instead of changing with their position.
 */
export const colorForName = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
};
