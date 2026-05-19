/**
 * MentorProgramTab — 4th tab on MentorPublicProfilePage / NestJoinDetailPage.
 *
 * Plan 14.5-02. Shows the mentor's current Program with each objective's
 * rule_summary so prospective mentees can evaluate requirements before applying.
 *
 * Backend contract (plan 14.5-01 AC-2):
 *   nest.current_program: null | {
 *     id, name, description,
 *     objectives: [{ id, title, rule_summary }]
 *   }
 */
import PropTypes from 'prop-types';

const MentorProgramTab = ({ program }) => {
    if (!program) {
        return (
            <div className="space-y-3 animate-fade-in py-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-2xl">flag</span>
                </div>
                <h3 className="font-bold text-slate-900">No active program yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    This mentor hasn&apos;t published a program yet. You won&apos;t be able to
                    enroll until they create one.
                </p>
            </div>
        );
    }

    const objectives = program.objectives || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="font-bold text-slate-900 mb-2">{program.name}</h3>
                {program.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">{program.description}</p>
                )}
            </div>

            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wide text-slate-700">
                    What you&apos;ll need to complete
                </h4>
                {objectives.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                        Mentor hasn&apos;t added objectives yet.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {objectives.map((obj) => (
                            <li
                                key={obj.id}
                                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/60 bg-white"
                            >
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                                    flag
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-900 text-sm">{obj.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{obj.rule_summary}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

MentorProgramTab.propTypes = {
    program: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        objectives: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string,
                title: PropTypes.string,
                rule_summary: PropTypes.string,
            }),
        ),
    }),
};

MentorProgramTab.defaultProps = {
    program: null,
};

export default MentorProgramTab;
