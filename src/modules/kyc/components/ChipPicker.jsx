import {
    Briefcase, Flag, Sparkles, GraduationCap, Rocket, Palette, Heart, Cpu, Check,
} from 'lucide-react';

const ICON_MAP = { Briefcase, Flag, Sparkles, GraduationCap, Rocket, Palette, Heart, Cpu };

export const ChipPicker = ({ options, value, onChange, max = 6, disabled }) => {
    const selected = value || [];

    const toggle = (v) => {
        if (disabled) return;
        if (selected.includes(v)) {
            onChange(selected.filter((x) => x !== v));
        } else if (selected.length < max) {
            onChange([...selected, v]);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2.5">
                {options.map((o) => {
                    const on = selected.includes(o.value);
                    const Icon = ICON_MAP[o.icon];
                    return (
                        <button
                            key={o.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggle(o.value)}
                            className={[
                                'inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition',
                                on
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-primary/5',
                            ].join(' ')}
                        >
                            {Icon && <Icon className="w-4 h-4" strokeWidth={2} />}
                            {o.label}
                            {on && <Check className="w-4 h-4" strokeWidth={3} />}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500 mt-3">
                {selected.length}/{max} selected
                {selected.length === max && ' · maximum reached'}
            </p>
        </div>
    );
};
