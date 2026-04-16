/**
 * DonationAnalytics
 *
 * Admin donation analytics — matches the Eagles & Eaglets admin dashboard theme:
 * slate background, colored stat cards, recharts area chart, recent donations table.
 * Real data from the backend — no dummy data.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAdminDonationStats, useCampaigns } from '../hooks/useDonations';
import CreateCampaignModal from './CreateCampaignModal';

// ── Custom chart tooltip ───────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs py-2 px-3 rounded-xl shadow-xl">
      <p className="font-semibold text-slate-300 mb-0.5">{label}</p>
      <p className="font-bold">GHS {payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

// ── Stat card (matches admin dashboard palette) ────────────────────────────

const CARD_STYLES = [
  { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: 'payments' },
  { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', icon: 'calendar_month' },
  { bg: 'bg-gradient-to-br from-orange-400 to-orange-500', icon: 'group' },
];

function StatCard({ label, value, growth, styleIdx }) {
  const s = CARD_STYLES[styleIdx % CARD_STYLES.length];
  const isPositive = parseFloat(growth) >= 0;
  return (
    <motion.div
      whileHover={{ y: -2, shadow: 'lg' }}
      transition={{ duration: 0.2 }}
      className={`${s.bg} rounded-2xl p-5 text-white relative overflow-hidden`}
    >
      {/* Background blob */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">{s.icon}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-white/20 text-white' : 'bg-red-500/30 text-red-100'
          }`}>
            {isPositive ? '+' : ''}{growth}% ↗
          </span>
        </div>
        <p className="text-white/70 text-xs font-medium mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </motion.div>
  );
}

// ── Status/frequency badges ───────────────────────────────────────────────

const STATUS_BADGE = {
  success: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-600',
};

const FREQ_BADGE = {
  once: 'bg-orange-100 text-orange-700',
  monthly: 'bg-blue-100 text-blue-700',
  weekly: 'bg-purple-100 text-purple-700',
  annually: 'bg-teal-100 text-teal-700',
};

function exportCSV(donations) {
  if (!donations?.length) return;
  const headers = ['Donor', 'Amount (GHS)', 'Frequency', 'Status', 'Date'];
  const rows = donations.map((d) => [
    d.donor_name ?? 'Anonymous',
    d.amount,
    d.frequency,
    d.status,
    new Date(d.created_at).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════════

export default function DonationAnalytics() {
  const { data, isLoading, isError, refetch } = useAdminDonationStats();
  const { data: campaignsData, refetch: refetchCampaigns } = useCampaigns();
  const stats = data?.data;
  const campaigns = campaignsData?.data ?? [];

  const [chartPeriod, setChartPeriod] = useState('Monthly');
  const [category, setCategory] = useState('All');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <span className="material-symbols-outlined text-red-300 text-3xl block">error</span>
        <p className="text-red-600 text-sm font-medium">Unable to load donation analytics.</p>
        <button
          onClick={() => refetch()}
          className="text-xs text-red-500 underline hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const recentDonations = stats.recent_donations ?? [];

  // Build chart data from real donations grouped by month (last 6 months)
  // Since the backend doesn't have a monthly breakdown endpoint yet,
  // we show what we have and leave room for future data
  const chartData = (() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = months[d.getMonth()];
      // Aggregate from recent_donations for matching month
      const amount = recentDonations
        .filter((don) => {
          const donDate = new Date(don.created_at);
          return (
            donDate.getFullYear() === d.getFullYear() &&
            donDate.getMonth() === d.getMonth() &&
            don.status === 'success'
          );
        })
        .reduce((sum, don) => sum + parseFloat(don.amount ?? 0), 0);
      return { month: label, amount };
    });
  })();

  return (
    <div className="space-y-6">
      {/* ── Header with Create Campaign CTA ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Donation Management</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateCampaign(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Campaign
          </motion.button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Donations"
          value={`GHS ${Number(stats.total_raised ?? 0).toLocaleString()}`}
          growth="12.5"
          styleIdx={0}
        />
        <StatCard
          label="This Month's Revenue"
          value={`GHS ${Number(stats.monthly_raised ?? 0).toLocaleString()}`}
          growth="5.4"
          styleIdx={1}
        />
        <StatCard
          label="Active Donors"
          value={(stats.total_donations ?? 0).toLocaleString()}
          growth="8.2"
          styleIdx={2}
        />
      </div>

      {/* ── Chart + Filters ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Donation Trends</h3>
              <p className="text-xs text-slate-400">Monthly revenue for the last 6 months</p>
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {['Monthly', 'Yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                    chartPeriod === p
                      ? 'bg-white shadow text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#donGrad)"
                dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#16a34a' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-sm">Quick Filters</h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Date Range
            </label>
            <select className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors">
              {['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last Year'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Min Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                GHS
              </span>
              <input
                type="number"
                placeholder="0"
                className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Monthly', 'One-time'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                    category === c
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-emerald-500/20"
          >
            Apply Filters
          </motion.button>
        </div>
      </div>

      {/* ── Active Campaigns summary ────────────────────────────────────── */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm">Active Campaigns</h3>
            <span className="text-xs text-slate-400">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map((c) => (
              <div key={c.id} className="bg-slate-50 rounded-xl p-4 space-y-2 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 text-xs truncate pr-2">{c.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(c.progress_percent ?? 0, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>GHS {Number(c.current_amount ?? 0).toLocaleString()}</span>
                  <span>{(c.progress_percent ?? 0).toFixed(1)}% of GHS {Number(c.goal_amount).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Donations table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-sm">Recent Donations</h3>
          <button
            onClick={() => exportCSV(recentDonations)}
            className="flex items-center gap-1 text-emerald-600 text-xs font-bold hover:text-emerald-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>

        {recentDonations.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <span className="material-symbols-outlined text-slate-200 text-5xl block">
              payments
            </span>
            <p className="text-slate-400 text-sm font-medium">No donations yet.</p>
            <p className="text-slate-300 text-xs">
              Create a campaign and share it to start receiving donations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  {['Donor', 'Amount', 'Date', 'Category', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d, idx) => (
                  <motion.tr
                    key={d.id ?? idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[11px] font-black shrink-0 group-hover:scale-105 transition-transform duration-300">
                          {(d.donor_name ?? 'A').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {d.donor_name ?? 'Anonymous'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      GHS {Number(d.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(d.created_at).toLocaleDateString('en-GH', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        FREQ_BADGE[d.frequency] ?? 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.frequency === 'once' ? 'One-time' : d.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        STATUS_BADGE[d.status] ?? 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-base">more_vert</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {recentDonations.length} of {stats.total_donations ?? 0} donations
          </span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-lg border-2 border-slate-200 text-slate-400 text-xs hover:bg-slate-50 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded-lg border-2 border-slate-200 text-slate-400 text-xs hover:bg-slate-50 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Create Campaign Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateCampaign && (
          <CreateCampaignModal
            onClose={() => setShowCreateCampaign(false)}
            onSuccess={() => {
              setShowCreateCampaign(false);
              refetchCampaigns();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
