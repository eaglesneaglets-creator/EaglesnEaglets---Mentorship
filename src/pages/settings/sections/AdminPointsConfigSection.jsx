import { useState } from 'react';
import { toast } from 'sonner';
import {
  usePointsConfigs,
  useUpdatePointsConfig,
  usePointsPolicy,
  useUpdatePointsPolicy,
} from '../../../modules/admin/hooks/usePointsConfig';

const ACTIVITY_ICONS = {
  video_complete: 'play_circle',
  document_read: 'description',
  assignment_submit: 'upload_file',
  assignment_graded: 'grading',
  module_complete: 'task_alt',
  check_in: 'event_available',
  post_created: 'edit_note',
  resource_shared: 'share',
  event_attended: 'groups',
};

function ConfigRow({ config }) {
  const updateMutation = useUpdatePointsConfig();
  const [pointsValue, setPointsValue] = useState(config.points_value);
  const [isActive, setIsActive] = useState(config.is_active);
  const [description, setDescription] = useState(config.description || '');

  const dirty =
    pointsValue !== config.points_value ||
    isActive !== config.is_active ||
    description !== (config.description || '');

  const handleSave = async () => {
    if (!dirty) return;
    try {
      await updateMutation.mutateAsync({
        id: config.id,
        patch: {
          points_value: Number(pointsValue),
          is_active: isActive,
          description,
        },
      });
      toast.success(`${config.display_name} saved`);
    } catch (err) {
      toast.error(err?.message || 'Could not save changes');
    }
  };

  const icon = ACTIVITY_ICONS[config.activity_type] || 'star';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <span
          className={`material-symbols-outlined text-2xl flex-shrink-0 ${
            isActive ? 'text-primary' : 'text-slate-300'
          }`}
        >
          {icon}
        </span>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">{config.display_name}</p>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-500">{isActive ? 'Active' : 'Disabled'}</span>
              <span className="relative inline-block w-9 h-5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="absolute inset-0 bg-slate-300 peer-checked:bg-primary rounded-full transition-colors" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Points
              </span>
              <input
                type="number"
                min={0}
                max={1000}
                value={pointsValue}
                onChange={(e) => setPointsValue(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Description
              </span>
              <input
                type="text"
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for admins"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!dirty || updateMutation.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Manual-award governance (Phase 31).
 *
 * Distinct from the per-activity rows below: those set values the platform
 * awards AUTOMATICALLY, while this caps what a mentor can hand out by hand.
 * Before this existed, manual awards were bounded only by a hardcoded value in
 * the API layer, with no daily limit at all.
 */
function ManualAwardPolicyCard() {
  const { data: policy, isLoading } = usePointsPolicy();

  if (isLoading || !policy) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Keyed remount rather than syncing props→state in an effect: when the policy
  // changes (e.g. after a save refetch) React re-runs the useState initialisers,
  // so the form always starts from server truth with no double render.
  return <PolicyForm key={policy.updated_at ?? policy.id} policy={policy} />;
}

function PolicyForm({ policy }) {
  const updateMutation = useUpdatePointsPolicy();

  const [maxPerAward, setMaxPerAward] = useState(policy.max_manual_award);
  const [dailyLimit, setDailyLimit] = useState(policy.daily_points_per_mentor);
  const [isEnforced, setIsEnforced] = useState(policy.is_enforced);

  const dirty =
    Number(maxPerAward) !== policy.max_manual_award ||
    Number(dailyLimit) !== policy.daily_points_per_mentor ||
    isEnforced !== policy.is_enforced;

  const handleSave = async () => {
    if (!dirty) return;
    try {
      await updateMutation.mutateAsync({
        max_manual_award: Number(maxPerAward),
        daily_points_per_mentor: Number(dailyLimit),
        is_enforced: isEnforced,
      });
      toast.success('Manual award limits saved');
    } catch (err) {
      toast.error(err?.message || 'Could not save limits');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <span className="material-symbols-outlined text-2xl flex-shrink-0 text-primary">
          shield_person
        </span>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Manual award limits</p>
              <p className="text-xs text-slate-500">
                Caps what a mentor can award by hand. The activity values below are
                separate — those are awarded automatically.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer flex-shrink-0">
              <span className="text-xs text-slate-500">
                {isEnforced ? 'Enforced' : 'Off'}
              </span>
              <span className="relative inline-block w-9 h-5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEnforced}
                  onChange={(e) => setIsEnforced(e.target.checked)}
                />
                <span className="absolute inset-0 bg-slate-300 peer-checked:bg-primary rounded-full transition-colors" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          </div>

          {!isEnforced && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              <span className="material-symbols-outlined text-sm align-middle mr-1">warning</span>
              Limits are currently <strong>off</strong> — mentors can award any amount.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Max per award
              </span>
              <input
                type="number"
                min={1}
                value={maxPerAward}
                onChange={(e) => setMaxPerAward(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
              <span className="text-[11px] text-slate-400">
                Most points a mentor can give in one go.
              </span>
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Daily budget per mentor
              </span>
              <input
                type="number"
                min={1}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
              <span className="text-[11px] text-slate-400">
                Total a mentor can award per day, across all mentees.
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!dirty || updateMutation.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPointsConfigSection() {
  const { data: configs = [], isLoading, isError } = usePointsConfigs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Points Config</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set the limits on mentor-issued points, and the values awarded
          automatically for platform actions.
        </p>
      </div>

      <ManualAwardPolicyCard />

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-slate-700">Automatic activity values</h3>
        <p className="text-xs text-slate-500">
          Points the platform awards on its own when a member completes these actions.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <span className="material-symbols-outlined text-2xl text-red-400">error</span>
          <p className="mt-1 text-sm text-red-600">Could not load configurations.</p>
        </div>
      ) : configs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">database</span>
          <p className="mt-2 text-sm text-slate-500 font-medium">No configurations seeded</p>
          <p className="mt-1 text-xs text-slate-400">
            Run <code className="px-1 py-0.5 bg-slate-100 rounded">manage.py seed_point_configs</code> on the backend to populate the 9 default activity types.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((c) => (
            <ConfigRow key={c.id} config={c} />
          ))}
        </div>
      )}
    </div>
  );
}
