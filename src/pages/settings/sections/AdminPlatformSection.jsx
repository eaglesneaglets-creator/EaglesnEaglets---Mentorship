const PLANNED_ITEMS = [
  {
    icon: 'palette',
    title: 'Organization branding',
    desc: 'Logo, colors, display name per tenant.',
  },
  {
    icon: 'language',
    title: 'Custom domain + subdomain',
    desc: 'Map each org to its own domain or subdomain.',
  },
  {
    icon: 'receipt_long',
    title: 'Billing tier + seat count',
    desc: 'Plan selection, seat limits, usage metering.',
  },
  {
    icon: 'admin_panel_settings',
    title: 'Platform staff vs org admin',
    desc: 'Split global platform role from per-org admin.',
  },
];

export default function AdminPlatformSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Platform Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tenant-wide settings for your organization.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-3xl text-primary flex-shrink-0">
            schedule
          </span>
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Coming in Phase 10 — Multi-tenant foundation
              </p>
              <p className="mt-1 text-xs text-slate-500">
                This surface unlocks once organizations are introduced.
              </p>
            </div>

            <div className="space-y-2">
              {PLANNED_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <span className="material-symbols-outlined text-lg text-slate-500 flex-shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Discovery artifact:{' '}
              <code className="px-1 py-0.5 bg-slate-100 rounded">
                .paul/phases/10-multi-tenant-architecture/
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
