import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@store';

const OPTIONS = [
  {
    value: 'public',
    icon: 'public',
    title: 'Public',
    desc: 'Anyone on the platform can view your profile.',
  },
  {
    value: 'nest_only',
    icon: 'groups',
    title: 'Nest Only',
    desc: 'Only members of the nests you belong to can see your profile.',
  },
  {
    value: 'private',
    icon: 'lock',
    title: 'Private',
    desc: 'Only you can see your profile. Mentors will not see you in browse.',
  },
];

export default function PrivacySection() {
  const { user, updateProfile } = useAuthStore();
  const initial = user?.profile_visibility || 'public';
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  const dirty = value !== (user?.profile_visibility || 'public');

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await updateProfile({ profile_visibility: value });
      toast.success('Privacy updated');
    } catch {
      toast.error('Could not update privacy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Privacy</h2>
        <p className="mt-1 text-sm text-slate-500">
          Control who can see your profile.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue(opt.value)}
              className={`w-full text-left flex items-start gap-4 rounded-2xl border p-5 transition-all ${
                selected
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span
                className={`material-symbols-outlined text-2xl flex-shrink-0 ${
                  selected ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {opt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${selected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {opt.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
              </div>
              <span
                className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                  selected ? 'border-primary bg-primary' : 'border-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
