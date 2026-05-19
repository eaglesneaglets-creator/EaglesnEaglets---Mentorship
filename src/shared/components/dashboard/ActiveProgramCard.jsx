/**
 * ActiveProgramCard — dashboard widget showing mentee's program state (plan 14-05 T6).
 *
 * Three states from access_status:
 *   - active program  -> name + nest + objectives count + Go to Nest CTA
 *   - pending request -> amber banner with View link
 *   - empty           -> Browse Communities CTA
 */
import { Link } from 'react-router-dom';
import { useActiveProgram, usePendingProgramRequest } from '@store';

export default function ActiveProgramCard() {
    const active = useActiveProgram();
    const pending = usePendingProgramRequest();

    if (active) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-lg shadow-emerald-500/20">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined">workspaces</span>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-90">Active Program</span>
                    </div>
                    <h3 className="text-xl font-extrabold mb-1">{active.name || 'Your Program'}</h3>
                    {active.nest_name && (
                        <p className="text-sm text-emerald-50 mb-3">in {active.nest_name}</p>
                    )}
                    <div className="flex items-center gap-4 mb-4 text-xs">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">flag</span>
                            {active.objectives_count ?? 0} objectives
                        </span>
                        {active.objectives_completed !== undefined && (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {active.objectives_completed} done
                            </span>
                        )}
                    </div>
                    <Link to="/eaglet/nest"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-semibold rounded-xl transition-colors">
                        Open Nest
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                </div>
            </div>
        );
    }

    if (pending) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-amber-600">schedule</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-amber-900">Application Pending</h3>
                        <p className="text-sm text-amber-800 mt-1">
                            {pending.nest_name ? `Awaiting approval from ${pending.nest_name}.` : 'Your application is awaiting mentor approval.'}
                        </p>
                    </div>
                </div>
                <Link to="/eaglet/nest"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-amber-900 hover:text-amber-700">
                    View request →
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="text-slate-900 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">diversity_3</span>
                    Join a Community
                </h3>
                <p className="text-slate-500 text-sm">
                    Apply to a mentor program to unlock assignments, messages, and resources.
                </p>
            </div>
            <Link to="/eaglet/nest"
                className="whitespace-nowrap inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-base">explore</span>
                Browse Communities
            </Link>
        </div>
    );
}
