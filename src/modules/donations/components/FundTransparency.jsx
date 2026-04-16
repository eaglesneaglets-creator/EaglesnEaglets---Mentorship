/**
 * FundTransparency
 *
 * Platform-themed sidebar showing fund allocation.
 * Emerald/slate palette, material-symbols, Framer Motion.
 */

import { motion } from 'framer-motion';

const ALLOCATIONS = [
  { label: 'Mentorship Programs', pct: 45, icon: 'school' },
  { label: 'Educational Resources', pct: 30, icon: 'menu_book' },
  { label: 'Community Outreach', pct: 15, icon: 'groups' },
  { label: 'Operational Costs', pct: 10, icon: 'settings' },
];

export default function FundTransparency() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-600 text-lg">
            account_balance
          </span>
        </div>
        <h3 className="font-black text-slate-900 text-sm">Fund Transparency</h3>
      </div>

      <div className="space-y-3">
        {ALLOCATIONS.map(({ label, pct, icon }, i) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-slate-300 text-sm">{icon}</span>
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </div>
              <span className="text-xs font-black text-emerald-600">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 + i * 0.08 }}
              />
            </div>
          </div>
        ))}
      </div>

      <blockquote className="flex gap-2 bg-emerald-50 rounded-2xl p-3 text-xs text-slate-500 italic">
        <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">
          format_quote
        </span>
        Every dollar is tracked and managed with the highest integrity to ensure maximum kingdom impact.
      </blockquote>
    </motion.div>
  );
}
