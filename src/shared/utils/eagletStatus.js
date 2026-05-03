export const EAGLET_STATUS_CONFIG = {
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Active' },
  behind:    { bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'Behind' },
  review:    { bg: 'bg-blue-50',    text: 'text-blue-600',    label: 'Review' },
  completed: { bg: 'bg-slate-50',   text: 'text-slate-600',   label: 'Completed' },
};

export function getEagletStatus(status) {
  return EAGLET_STATUS_CONFIG[status] || EAGLET_STATUS_CONFIG.active;
}
