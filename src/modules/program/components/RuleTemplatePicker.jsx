/**
 * RuleTemplatePicker — modal popup showing the rule templates (plan 14-06 T3,
 * upgraded to modal in phase 15 follow-up).
 *
 * Why modal not dropdown: dropdown pushed objective card layout around at
 * narrow widths and clipped at viewport edges. Modal centers, backdrop
 * darkens context, ESC + click-away close cleanly.
 */
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RULE_TEMPLATES } from '../constants/ruleTemplates';

export default function RuleTemplatePicker({ onSelect, disabled }) {
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    const handlePick = (template) => {
        close();
        onSelect(template);
    };

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        // Lock background scroll while modal open
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
                <span className="material-symbols-outlined text-base">add</span>
                Add Rule
            </button>

            {open && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="rule-picker-title"
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h3 id="rule-picker-title" className="text-base font-bold text-slate-900">Add a rule</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Pick what mentees must complete.</p>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {RULE_TEMPLATES.map((t) => (
                                <button
                                    key={t.type}
                                    type="button"
                                    onClick={() => handlePick(t)}
                                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-slate-50 text-left transition-colors rounded-lg"
                                >
                                    <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">{t.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{t.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{t.helpText}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}

RuleTemplatePicker.propTypes = {
    onSelect: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};
