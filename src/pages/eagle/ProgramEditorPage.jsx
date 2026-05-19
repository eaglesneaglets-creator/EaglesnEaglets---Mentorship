/**
 * ProgramEditorPage — mentor's program management surface (plans 14-06 T2 + 14.5-02 T3).
 *
 * Routes: /eagle/nests/:nestId/program
 *
 * States:
 *   - no programs    -> ProgramForm (firstCreate mode, includes Nest rename input)
 *   - has programs   -> Edit current (active first, draft fallback) + objective builder
 *
 * Selector logic (plan 14.5-02): pick active program; if none, latest draft.
 * Avoids the old `programs[0]` bug which was order-dependent and unreliable
 * for mentors with multiple Nests/programs.
 */
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import {
    usePrograms,
    useCreateProgram,
    useUpdateProgram,
} from '../../modules/program/hooks/usePrograms';
import { useNestDetail, useUpdateNest } from '../../modules/nest/hooks/useNests';
import ProgramForm from '../../modules/program/components/ProgramForm';
import ProgramObjectiveBuilder from '../../modules/program/components/ProgramObjectiveBuilder';

const STATUS_BADGE = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-amber-100 text-amber-700',
};

function pickCurrentProgram(programs) {
    if (!Array.isArray(programs) || programs.length === 0) return null;
    return (
        programs.find((p) => p.status === 'active') ||
        programs.find((p) => p.status === 'draft') ||
        programs[0]
    );
}

export default function ProgramEditorPage() {
    const { nestId } = useParams();
    const { data, isLoading } = usePrograms(nestId);
    const { data: nestResponse } = useNestDetail(nestId);
    const createProgram = useCreateProgram(nestId);
    const updateProgram = useUpdateProgram(nestId);
    const updateNest = useUpdateNest(nestId);

    const programs = data?.data || data?.results || data || [];
    const programsList = Array.isArray(programs) ? programs : [];
    const program = pickCurrentProgram(programsList);
    const firstCreate = !program && programsList.length === 0;
    const nest = nestResponse?.data || nestResponse || {};

    const handleSubmit = (body) => {
        const renameTarget = body.__nestRename;
        delete body.__nestRename;

        // Plan 14.5-02: on first create, fire Nest rename + program create together.
        // Rename failure does not block program create — program is the priority.
        if (renameTarget) {
            updateNest.mutate(
                { name: renameTarget },
                {
                    onError: () => {
                        // Surface via toast in real app; non-blocking here.
                    },
                },
            );
        }

        if (program?.id) {
            updateProgram.mutate({ pk: program.id, body });
        } else {
            createProgram.mutate(body);
        }
    };

    return (
        <DashboardLayout variant="eagle">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Link to={`/eagle/nests/${nestId}`} className="hover:text-primary inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to Nest
                    </Link>
                </div>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-extrabold text-slate-900">Program</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Define the mentee journey for this Nest.
                        </p>
                    </div>
                    {program?.status && (
                        <span className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full ${STATUS_BADGE[program.status] || ''}`}>
                            {program.status.toUpperCase()}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                ) : (
                    <>
                        <ProgramForm
                            initial={program || null}
                            onSubmit={handleSubmit}
                            submitting={createProgram.isPending || updateProgram.isPending}
                            firstCreate={firstCreate}
                            initialNestName={nest.name || ''}
                        />

                        {program?.id && (
                            <ProgramObjectiveBuilder nestId={nestId} programId={program.id} />
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
