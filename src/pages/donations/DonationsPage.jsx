/**
 * DonationsPage — Public Donation Page
 *
 * Uses the platform's shared Navbar and Footer.
 * Emerald/slate theme with Framer Motion animations.
 * Real campaign data from the backend — no dummy data.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicNavbar from '@shared/components/layout/PublicNavbar';
import PublicFooter from '@shared/components/layout/PublicFooter';
import { useCampaigns } from '@modules/donations/hooks/useDonations';
import DonationForm from '@modules/donations/components/DonationForm';
import FundTransparency from '@modules/donations/components/FundTransparency';

// ── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
};

// ── Campaign selector tab ─────────────────────────────────────────────────────

function CampaignTab({ campaign, isActive, onClick }) {
  const pct = Math.min(campaign.progress_percent ?? 0, 100);
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        isActive
          ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10'
          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
      }`}
    >
      <p className={`font-bold text-sm mb-1 ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>
        {campaign.title}
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {pct.toFixed(0)}%
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-1">
        GHS {Number(campaign.current_amount ?? 0).toLocaleString()} of GHS{' '}
        {Number(campaign.goal_amount).toLocaleString()}
      </p>
    </motion.button>
  );
}

// ── Impact stats row ─────────────────────────────────────────────────────────

const IMPACT_STATS = [
  { icon: 'volunteer_activism', label: 'Giving', value: 'Make a Difference' },
  { icon: 'groups', label: 'Community', value: 'Join Thousands' },
  { icon: 'cottage', label: 'Safe Space', value: 'Build Together' },
  { icon: 'handshake', label: 'Partnership', value: 'Grow Together' },
];

// ═══════════════════════════════════════════════════════════════════════════════

export default function DonationsPage() {
  const { data, isLoading, isError } = useCampaigns();
  const campaigns = data?.data ?? [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const campaign = campaigns[selectedIdx] ?? campaigns[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      <PublicNavbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Base gradient — matches AboutPage's MentorshipWorks + platform primary */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-emerald-700" />

        {/* Glossy sheen — soft white highlight from top-left, fades into transparency.
            Two stacked overlays give a wet-glass feel without overpowering the green. */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/[0.04] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent pointer-events-none" />

        {/* Subtle grid pattern — same one used on AboutPage MentorshipWorks for visual continuity */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating blobs — kept inside hero by overflow-hidden on the section */}
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-80 h-48 sm:h-72 lg:h-80 bg-emerald-300/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-56 lg:w-64 h-40 sm:h-56 lg:h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bottom edge gloss — thin highlight band that gives the section a "polished" rim */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/25 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 shadow-sm">
              <span className="material-symbols-outlined text-sm">volunteer_activism</span>
              Support the Ministry
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="text-[26px] sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4 leading-[1.1] drop-shadow-[0_2px_8px_rgba(6,78,59,0.25)]"
          >
            Every Gift Shapes a{' '}
            <span className="text-white/95 underline decoration-white/40 decoration-4 underline-offset-4">Leader</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="text-white/85 text-[13px] sm:text-base md:text-lg max-w-xl mx-auto mb-5 sm:mb-8 leading-relaxed px-1"
          >
            Every contribution helps us provide more resources, mentoring sessions, and safe
            environments for our eaglets to soar. Together, we can make a lasting impact.
          </motion.p>

          {/* Impact icons — grid on tiny phones, flex-wrap row from sm up.
              Grid prevents the row from over-shrinking and crashing into itself
              on 320–375px screens. */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="grid grid-cols-4 sm:flex sm:flex-wrap items-start justify-center gap-x-2 sm:gap-x-8 gap-y-3 sm:gap-y-4 max-w-md sm:max-w-none mx-auto"
          >
            {IMPACT_STATS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex flex-col items-center gap-1.5 group min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-lg shadow-emerald-900/10 group-hover:shadow-xl group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                  <span className="material-symbols-outlined text-white text-lg sm:text-xl">
                    {item.icon}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-white/85 font-medium text-center leading-tight">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <section id="donate" className="max-w-6xl mx-auto px-3 sm:px-6 -mt-6 sm:-mt-8 pb-12 sm:pb-20 relative z-10">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm"
          >
            <span className="material-symbols-outlined text-2xl mb-2 block">error</span>
            Unable to load campaigns. Please refresh and try again.
          </motion.div>
        )}

        {!isLoading && !isError && campaigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 text-center shadow-sm"
          >
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">
              volunteer_activism
            </span>
            <h3 className="font-bold text-slate-900 text-lg mb-2">No active campaigns</h3>
            <p className="text-slate-500 text-sm">Check back soon — new campaigns are coming!</p>
          </motion.div>
        )}

        {campaigns.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.15}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Left: campaign selector (if multiple) + donation form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Campaign tabs — only show if more than one */}
              {campaigns.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
                    Choose a Campaign
                  </p>
                  {campaigns.map((c, idx) => (
                    <CampaignTab
                      key={c.id}
                      campaign={c}
                      isActive={idx === selectedIdx}
                      onClick={() => setSelectedIdx(idx)}
                    />
                  ))}
                </div>
              )}

              {/* Donation form */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={campaign?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {campaign && <DonationForm campaignId={campaign.id} campaign={campaign} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: transparency + campaign progress */}
            <div className="space-y-4">
              <FundTransparency />

              {campaign && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">
                        campaign
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{campaign.title}</h4>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>
                        GHS {Number(campaign.current_amount ?? 0).toLocaleString()} raised
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {(campaign.progress_percent ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <motion.div
                        className="bg-emerald-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(campaign.progress_percent ?? 0, 100)}%`,
                        }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Goal: GHS {Number(campaign.goal_amount).toLocaleString()}
                    </p>
                  </div>
                  {campaign.description && (
                    <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                      {campaign.description}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
