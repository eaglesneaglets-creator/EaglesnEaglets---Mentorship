/**
 * CreateCampaignModal
 *
 * Admin/Eagle modal to create a new donation campaign.
 * POST /api/v1/donations/campaigns/ (requires Eagle or Admin role).
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api';
import { donationKeys } from '../hooks/useDonations';

async function createCampaign(data) {
  return apiClient.post('/donations/campaigns/', data);
}

export default function CreateCampaignModal({ onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal_amount: '',
    start_date: '',
    end_date: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.campaigns() });
      onSuccess?.();
    },
    onError: (err) => {
      setError(err?.message ?? 'Failed to create campaign. Check your permissions.');
    },
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Campaign title is required.');
    if (!form.goal_amount || parseFloat(form.goal_amount) < 1)
      return setError('Goal amount must be at least GHS 1.');

    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      goal_amount: parseFloat(form.goal_amount).toFixed(2),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
  }

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-xl">campaign</span>
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">New Campaign</h2>
              <p className="text-xs text-slate-400">Create a donation campaign</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Campaign Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Eaglet Scholarship Fund 2026"
              value={form.title}
              onChange={set('title')}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Description
            </label>
            <textarea
              placeholder="What will this campaign fund? How will donations be used?"
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Goal amount */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Fundraising Goal (GHS) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                GHS
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="5000.00"
                value={form.goal_amount}
                onChange={set('goal_amount')}
                className="w-full border-2 border-slate-200 rounded-2xl pl-14 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={set('start_date')}
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={set('end_date')}
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileHover={{ scale: mutation.isPending ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black text-sm transition-colors shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">add</span>
                  Create Campaign
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

CreateCampaignModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
