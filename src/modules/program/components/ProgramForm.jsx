/**
 * ProgramForm — name + description + status editor (plan 14-06 T2).
 */
import PropTypes from 'prop-types';
import { useState } from 'react';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'archived', label: 'Archived', color: 'bg-amber-100 text-amber-700' },
];

export default function ProgramForm({ initial, onSubmit, submitting, firstCreate, initialNestName }) {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [status, setStatus] = useState(initial?.status || 'draft');
    // Plan 14.5-02: first-program creation lets mentor rename the auto-Nest.
    const [nestName, setNestName] = useState(initialNestName || '');

    const valid = name.trim().length >= 3 && (!firstCreate || nestName.trim().length >= 2);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valid || submitting) return;
        const payload = { name: name.trim(), description: description.trim(), status };
        if (firstCreate && nestName.trim() && nestName.trim() !== initialNestName) {
            payload.__nestRename = nestName.trim();
        }
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
            {firstCreate && (
                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Nest Name
                    </label>
                    <input
                        type="text"
                        value={nestName}
                        onChange={(e) => setNestName(e.target.value)}
                        placeholder="e.g. Career Acceleration Hub"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        minLength={2}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        First program — rename your Nest now. You can change it later in Nest settings.
                    </p>
                </div>
            )}
            <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Program Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Leadership Foundations Cohort 1"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    minLength={3}
                    required
                />
                {name.length > 0 && name.length < 3 && (
                    <p className="text-xs text-red-500 mt-1">Name must be at least 3 characters.</p>
                )}
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="What will mentees learn? What's the commitment?"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Status
                </label>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStatus(opt.value)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${status === opt.value
                                ? `${opt.color} ring-2 ring-offset-1 ring-current`
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {status === 'active' && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Once enrollments exist, core program rules become locked.
                    </p>
                )}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={!valid || submitting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    {submitting ? 'Saving...' : (initial ? 'Save Changes' : 'Create Program')}
                </button>
            </div>
        </form>
    );
}

ProgramForm.propTypes = {
    initial: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    firstCreate: PropTypes.bool,
    initialNestName: PropTypes.string,
};
