/**
 * MenteeLevelCard — 5-level progression widget (plan 14-05 T6).
 * Reads mentee_level from access_status (current/next thresholds + mentor_eligible).
 *
 * Plan 16-02: when the user becomes mentor-eligible, replace the static
 * "Eligible to apply" banner with a state-aware CTA strip that mirrors the
 * /eaglet/mentor-application page (eligible / submitted / approved / rejected).
 */
import { Link } from 'react-router-dom';
import {
    useMenteeLevel,
    useMentorApplicationStatus,
    useMentorApplicationEligible,
} from '@store';

function MentorApplicationStrip() {
    const eligible = useMentorApplicationEligible();
    const status = useMentorApplicationStatus();

    if (!eligible && !status) return null;

    if (status === 'approved') {
        return (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0">verified</span>
                    <p className="text-xs font-semibold text-emerald-900 truncate">You’re now a mentor</p>
                </div>
                <Link
                    to="/eagle/dashboard"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 shrink-0"
                >
                    Open mentor dashboard →
                </Link>
            </div>
        );
    }

    if (status === 'submitted') {
        return (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-lg">hourglass_top</span>
                <p className="text-xs font-semibold text-amber-900">
                    Application pending — we’ll email you when reviewed
                </p>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                    <p className="text-xs font-semibold text-red-900">
                        Application not approved — you can review & re-apply
                    </p>
                </div>
                <Link
                    to="/eaglet/mentor-application"
                    className="inline-block text-xs font-semibold text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100"
                >
                    Re-apply
                </Link>
            </div>
        );
    }

    if (status === 'withdrawn') {
        return (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-600 text-lg">undo</span>
                    <p className="text-xs font-semibold text-slate-800">
                        Application withdrawn — re-apply when ready
                    </p>
                </div>
                {eligible && (
                    <Link
                        to="/eaglet/mentor-application"
                        className="inline-block text-xs font-semibold text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-white"
                    >
                        Re-apply
                    </Link>
                )}
            </div>
        );
    }

    // Eligible + no prior application → fresh apply CTA.
    if (eligible) {
        return (
            <Link
                to="/eaglet/mentor-application"
                className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 hover:bg-amber-100 transition group"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">military_tech</span>
                    <p className="text-xs font-semibold text-amber-900">
                        Apply to become a mentor
                    </p>
                </div>
                <span className="material-symbols-outlined text-amber-700 text-base group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                </span>
            </Link>
        );
    }

    return null;
}

export default function MenteeLevelCard() {
    const level = useMenteeLevel();

    if (!level) return null;

    const current = level.current_level ?? 0;
    // Accept both BE-canonical and FE-alias field names for forward compat.
    const next = level.next_threshold ?? null;
    const progress = level.progress_pct ?? 0;
    const points = level.points ?? level.points_total ?? 0;
    const requiresEnrollment = level.requires_enrollment === true;

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

            {requiresEnrollment ? (
                <p className="text-xs text-slate-500 leading-relaxed">
                    Levels are earned through program participation. Join a community
                    to start earning level points — your Growth Points are tracked
                    separately.
                </p>
            ) : (
              <>
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
              </>
            )}

            {/* Mentor-application state strip — supersedes the old eligibility-only banner.
                Render unconditionally; the strip's own guard returns null when neither
                eligible nor any application status exists. This ensures users who lose
                eligibility after applying still see their pending/approved/rejected status. */}
            <MentorApplicationStrip />
        </div>
    );
}
