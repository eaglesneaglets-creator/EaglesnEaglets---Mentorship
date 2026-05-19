/**
 * ObjectiveCard — single objective with title + ≥1 rules (plan 14-06 T3).
 *
 * All rules required (v1) — copy reads "Mentee must complete ALL of:".
 * target validation: min=1 mirrors BE PositiveIntegerField.
 */
import PropTypes from 'prop-types';
import { useState } from 'react';
import RuleTemplatePicker from './RuleTemplatePicker';
import { RULE_TEMPLATE_BY_TYPE } from '../constants/ruleTemplates';

export default function ObjectiveCard({
    objective,
    onUpdateTitle,
    onDelete,
    onAddRule,
    onUpdateRule,
    onDeleteRule,
}) {
    const [title, setTitle] = useState(objective.title || '');
    const rules = objective.rules || [];

    const handleTitleBlur = () => {
        if (title !== objective.title) onUpdateTitle(title);
    };

    const handleAddRule = (template) => {
        onAddRule({
            rule_type: template.type,
            target: template.defaultTarget,
            config: {},
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3 mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Objective title (e.g. Master the basics)"
                    className="flex-1 text-base font-semibold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-primary focus:outline-none px-1 py-1"
                />
                <button
                    type="button"
                    onClick={onDelete}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Delete objective"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>

            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Mentee must complete ALL of:
            </p>

            <div className="space-y-2 mb-3">
                {rules.length === 0 && (
                    <p className="text-sm text-slate-400 italic px-2 py-3 border border-dashed border-slate-200 rounded-lg text-center">
                        No rules yet — add at least one below.
                    </p>
                )}
                {rules.map((rule) => (
                    <RuleRow
                        key={rule.id}
                        rule={rule}
                        onUpdateRule={onUpdateRule}
                        onDeleteRule={onDeleteRule}
                    />
                ))}
            </div>

            <RuleTemplatePicker onSelect={handleAddRule} />
        </div>
    );
}

ObjectiveCard.propTypes = {
    objective: PropTypes.object.isRequired,
    onUpdateTitle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAddRule: PropTypes.func.isRequired,
    onUpdateRule: PropTypes.func,
    onDeleteRule: PropTypes.func.isRequired,
};

function RuleRow({ rule, onUpdateRule, onDeleteRule }) {
    const template = RULE_TEMPLATE_BY_TYPE[rule.rule_type] || {
        label: rule.rule_type, icon: 'help', unit: '',
    };
    const [draft, setDraft] = useState(rule.target ?? 1);
    const invalid = !draft || Number(draft) < 1;

    const commit = () => {
        const next = Math.max(1, parseInt(draft, 10) || 1);
        if (next !== rule.target) {
            onUpdateRule?.(rule.id, { target: next });
        }
        setDraft(next);
    };

    return (
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 p-2.5 bg-slate-50 rounded-lg">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">{template.icon}</span>
            <div className="flex-1 min-w-0 flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-slate-700">{template.label}:</span>
                <input
                    type="number"
                    min={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className={`w-20 shrink-0 px-2 py-1 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-primary/30 ${invalid ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                />
                <span className="text-sm text-slate-500">{template.unit}</span>
            </div>
            <button
                type="button"
                onClick={() => onDeleteRule(rule.id)}
                className="p-1 shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove rule"
            >
                <span className="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    );
}

RuleRow.propTypes = {
    rule: PropTypes.object.isRequired,
    onUpdateRule: PropTypes.func,
    onDeleteRule: PropTypes.func.isRequired,
};
