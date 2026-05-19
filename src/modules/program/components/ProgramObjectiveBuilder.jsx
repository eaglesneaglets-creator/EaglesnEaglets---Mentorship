/**
 * ProgramObjectiveBuilder — list of objectives + add-objective button (plan 14-06 T3).
 */
import PropTypes from 'prop-types';
import {
    useObjectives,
    useCreateObjective,
    useUpdateObjective,
    useDeleteObjective,
    useCreateRule,
    useUpdateRule,
    useDeleteRule,
} from '../hooks/useObjectives';
import ObjectiveCard from './ObjectiveCard';

export default function ProgramObjectiveBuilder({ nestId, programId }) {
    const { data, isLoading } = useObjectives(nestId, programId);
    const createObjective = useCreateObjective(nestId, programId);
    const updateObjective = useUpdateObjective(nestId, programId);
    const deleteObjective = useDeleteObjective(nestId, programId);
    const createRule = useCreateRule(nestId, programId);
    const updateRule = useUpdateRule(nestId, programId);
    const deleteRule = useDeleteRule(nestId, programId);

    const objectives = data?.data || data?.results || data || [];

    const handleAddObjective = () => {
        // Prompt for a real title at create time so mentors don't ship the
        // "New objective" placeholder by accident. Empty input → no-op.
        const title = window.prompt('Objective title:', '')?.trim();
        if (!title) return;
        createObjective.mutate({ title });
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-900">Objectives</h2>
                    <p className="text-sm text-slate-500">All required for program completion.</p>
                </div>
                <button
                    type="button"
                    onClick={handleAddObjective}
                    disabled={createObjective.isPending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors w-full sm:w-auto"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add Objective
                </button>
            </div>

            {objectives.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">flag</span>
                    <p className="text-slate-500">No objectives defined yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Click "Add Objective" to define what mentees need to accomplish.
                    </p>
                </div>
            ) : (
                objectives.map((obj) => (
                    <ObjectiveCard
                        key={obj.id}
                        objective={obj}
                        onUpdateTitle={(title) =>
                            updateObjective.mutate({ pk: obj.id, body: { title } })
                        }
                        onDelete={() => deleteObjective.mutate(obj.id)}
                        onAddRule={(body) =>
                            createRule.mutate({ objectiveId: obj.id, body })
                        }
                        onUpdateRule={(ruleId, body) =>
                            updateRule.mutate({ objectiveId: obj.id, pk: ruleId, body })
                        }
                        onDeleteRule={(ruleId) =>
                            deleteRule.mutate({ objectiveId: obj.id, pk: ruleId })
                        }
                    />
                ))
            )}
        </div>
    );
}

ProgramObjectiveBuilder.propTypes = {
    nestId: PropTypes.string.isRequired,
    programId: PropTypes.string.isRequired,
};
