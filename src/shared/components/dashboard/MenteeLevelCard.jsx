/**
 * MenteeLevelCard — 5-level progression widget (plan 14-05 T6).
 * Reads mentee_level from access_status (current/next thresholds + mentor_eligible).
 */
import { useMenteeLevel, useMentorEligibility } from '@store';

export default function MenteeLevelCard() {
    const level = useMenteeLevel();
    const eligible = useMentorEligibility();

    if (!level) return null;

    const current = level.current_level ?? 0;
    const next = level.next_threshold;
    const progress = level.progress_pct ?? 0;
    const points = level.points ?? 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mentee Level</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">
                        Level {current}<span className="text-slate-400 text-lg font-bold"> / 5</span>
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">trending_up</span>
                </div>
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>{points.toLocaleString()} pts</span>
                {next != null && current < 5 && (
                    <span>Next: {next.toLocaleString()} pts</span>
                )}
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>

            {eligible && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-lg">military_tech</span>
                    <p className="text-xs font-semibold text-amber-900">
                        Eligible to apply as mentor
                    </p>
                </div>
            )}
        </div>
    );
}
