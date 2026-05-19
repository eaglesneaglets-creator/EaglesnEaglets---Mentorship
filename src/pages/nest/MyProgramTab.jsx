/**
 * MyProgramTab — current program detail or empty/pending CTA (plan 14-05 T5).
 *
 * Three states:
 *   - active program       -> show program card + objectives stub
 *   - pending request      -> show pending notice with link to Requests tab
 *   - neither              -> empty state nudging to Discover
 */
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useActiveProgram, usePendingProgramRequest } from '@store';
import EmptyState from '../../shared/components/ui/EmptyState';
import { useEnums } from '@hooks/useEnums';

export default function MyProgramTab({ onSwitchTab }) {
    const active = useActiveProgram();
    const pending = usePendingProgramRequest();
    const enums = useEnums();

    if (active) {
        return (
            <section className="flex flex-col gap-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined">verified</span>
                            <span className="text-xs font-semibold tracking-wider uppercase">Active Program</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                            {active.name || 'Your Program'}
                        </h1>
                        {active.nest_name && (
                            <p className="text-emerald-100 text-sm mb-3">in {active.nest_name}</p>
                        )}
                        {active.description && (
                            <p className="text-emerald-50 text-base leading-relaxed max-w-2xl">
                                {active.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1">Status</p>
                        <p className="text-lg font-bold text-emerald-600">
                            {enums.enrollment_status?.[active.status] || enums.program_status?.[active.status] || 'Active'}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1">Started</p>
                        <p className="text-lg font-bold text-slate-900">
                            {active.started_at ? new Date(active.started_at).toLocaleDateString() : '—'}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1">Objectives</p>
                        <p className="text-lg font-bold text-slate-900">
                            {active.objectives_count ?? 0} required
                        </p>
                    </div>
                </div>

                {active.nest_id && (
                    <div className="flex justify-end">
                        <Link to={`/eaglet/nest/${active.nest_id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                            Go to Nest
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                    </div>
                )}
            </section>
        );
    }

    if (pending) {
        return (
            <section className="flex flex-col gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-amber-600">schedule</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-amber-900 mb-1">Application Pending</h2>
                        <p className="text-sm text-amber-800 mb-3">
                            Your application to {pending.nest_name || 'a program'} is awaiting mentor approval.
                            You can have only one pending request at a time.
                        </p>
                        <button onClick={() => onSwitchTab?.('requests')}
                            className="text-sm font-semibold text-amber-900 hover:text-amber-700 underline">
                            View request details →
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <EmptyState
            icon="diversity_3"
            title="You're not in a program yet"
            description="Browse Discover to find a mentor program that fits your growth goals."
            actionLabel="Browse Discover"
            onAction={() => onSwitchTab?.('discover')}
        />
    );
}

MyProgramTab.propTypes = {
    onSwitchTab: PropTypes.func,
};
