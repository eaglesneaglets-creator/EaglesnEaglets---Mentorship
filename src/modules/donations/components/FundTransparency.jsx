/**
 * FundTransparency
 *
 * Sidebar block on the donations page. Previously a fund-allocation breakdown
 * with progress bars and a closing quote — simplified to just the integrity
 * statement so the donations sidebar stays focused on the call to give.
 */

import { motion } from 'framer-motion';

export default function FundTransparency() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm"
    >
      <blockquote className="flex gap-2 bg-emerald-50 rounded-2xl p-4 text-sm text-slate-600 italic leading-relaxed">
        <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0 mt-0.5">
          format_quote
        </span>
        Every dollar is tracked and managed with the highest integrity to ensure maximum kingdom impact.
      </blockquote>
    </motion.div>
  );
}
