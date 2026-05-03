import { useState } from 'react';

function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function deriveMaster(events, channel) {
  const key = channel === 'email' ? 'email_enabled' : 'inapp_enabled';
  const onCount = events.filter((e) => e[key]).length;
  if (onCount === 0) return false;
  if (onCount === events.length) return true;
  return 'mixed';
}

export default function DomainPrefCard({ domain, onUpdate, isUpdating }) {
  const [open, setOpen] = useState(false);

  const emailMaster = deriveMaster(domain.events, 'email');
  const inappMaster = deriveMaster(domain.events, 'inapp');

  const handleMaster = (channel, nextValue) => {
    const updated = domain.events.map((e) => ({
      event_type: e.event_type,
      email_enabled: channel === 'email' ? nextValue : e.email_enabled,
      inapp_enabled: channel === 'inapp' ? nextValue : e.inapp_enabled,
    }));
    onUpdate(updated);
  };

  const handleEvent = (event, channel, nextValue) => {
    onUpdate([
      {
        event_type: event.event_type,
        email_enabled: channel === 'email' ? nextValue : event.email_enabled,
        inapp_enabled: channel === 'inapp' ? nextValue : event.inapp_enabled,
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-lg hover:bg-slate-50 -m-2 p-2 transition-colors"
        >
          <span
            className={`material-symbols-outlined text-slate-500 transition-transform ${
              open ? 'rotate-90' : ''
            }`}
          >
            chevron_right
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{domain.label}</h3>
            <p className="text-xs text-slate-500">{domain.events.length} events</p>
          </div>
        </button>
        <div className="flex items-center gap-6 ml-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Email</span>
            <ToggleSwitch
              checked={emailMaster === true}
              onChange={(v) => handleMaster('email', v)}
              disabled={isUpdating}
              label={`${domain.label} email`}
            />
            {emailMaster === 'mixed' && <span className="text-[9px] text-slate-400">mixed</span>}
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">In-app</span>
            <ToggleSwitch
              checked={inappMaster === true}
              onChange={(v) => handleMaster('inapp', v)}
              disabled={isUpdating}
              label={`${domain.label} in-app`}
            />
            {inappMaster === 'mixed' && <span className="text-[9px] text-slate-400">mixed</span>}
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {domain.events.map((evt) => (
            <div key={evt.event_type} className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-slate-700">{evt.label}</span>
              <div className="flex items-center gap-6">
                <ToggleSwitch
                  checked={evt.email_enabled}
                  onChange={(v) => handleEvent(evt, 'email', v)}
                  disabled={isUpdating}
                  label={`${evt.label} email`}
                />
                <ToggleSwitch
                  checked={evt.inapp_enabled}
                  onChange={(v) => handleEvent(evt, 'inapp', v)}
                  disabled={isUpdating}
                  label={`${evt.label} in-app`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
