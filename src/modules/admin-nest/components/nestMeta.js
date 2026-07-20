/**
 * Shared category + status presentation metadata for admin nest UI.
 * Emerald primary theme; accent hues per category for the card header band.
 */

export const CATEGORY_META = {
  faith: { label: 'Faith & Profession', gradient: 'from-emerald-500 to-teal-600', icon: 'menu_book' },
  leadership: { label: 'Leadership', gradient: 'from-blue-500 to-indigo-600', icon: 'rocket_launch' },
  finance: { label: 'Finance & Stewardship', gradient: 'from-slate-500 to-slate-600', icon: 'savings' },
  relationships: { label: 'Relationships', gradient: 'from-amber-500 to-orange-500', icon: 'favorite' },
  career: { label: 'Career', gradient: 'from-violet-500 to-purple-600', icon: 'work' },
  other: { label: 'Other', gradient: 'from-emerald-400 to-emerald-600', icon: 'diversity_3' },
};

export const categoryMeta = (category) => CATEGORY_META[category] || CATEGORY_META.other;

export const STATUS_META = {
  active: { label: 'Active', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  forming: { label: 'Forming', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  archived: { label: 'Archived', dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const statusMeta = (status) => STATUS_META[status] || STATUS_META.forming;

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([value, m]) => ({
  value,
  label: m.label,
}));
