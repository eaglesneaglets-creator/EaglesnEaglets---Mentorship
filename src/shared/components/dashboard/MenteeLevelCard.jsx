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

import Icon from '@shared/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

function MentorApplicationStrip() {
    const eligible = useMentorApplicationEligible();
    const status = useMentorApplicationStatus();

    if (!eligible && !status) return null;

    if (status === 'approved') {
        return (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <Icon name='verified' className='text-emerald-600 text-lg shrink-0' />
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
                <Icon name='hourglass_top' className='text-amber-600 text-lg' />
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
                    <Icon name='error' className='text-red-600 text-lg' />
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
                    <Icon name='undo' className='text-slate-600 text-lg' />
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
                    <Icon name='military_tech' className='text-amber-600 text-lg shrink-0' />
                    <p className="text-xs font-semibold text-amber-900">
                        Apply to become a mentor
                    </p>
                </div>
                <Icon
                    name='arrow_forward'
                    className='text-amber-700 text-base group-hover:translate-x-0.5 transition-transform' />
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
        <Card>
            <CardHeader>
                <CardDescription>Mentee level</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">
                    Level {current}<span className="text-lg font-semibold text-muted-foreground"> / 5</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {requiresEnrollment ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Levels are earned through program participation. Join a community
                        to start earning level points. Your Growth Points are tracked
                        separately.
                    </p>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{points.toLocaleString()} pts</span>
                            {next != null && current < 5 && (
                                <span>Next: {next.toLocaleString()} pts</span>
                            )}
                        </div>
                        <Progress
                            value={Math.min(100, Math.max(0, progress))}
                            aria-label={`${Math.round(progress)}% of the way to the next level`}
                        />
                    </div>
                )}

                {/* Mentor-application state strip: renders unconditionally; it
                    returns null when neither eligible nor any application exists. */}
                <MentorApplicationStrip />
            </CardContent>
        </Card>
    );
}
