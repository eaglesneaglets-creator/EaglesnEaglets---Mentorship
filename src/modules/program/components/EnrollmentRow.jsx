/**
 * EnrollmentRow — single enrollment with status-aware action buttons (plan 14-06 T4).
 *
 * Action visibility per status:
 *   pending   -> Approve / Reject
 *   active    -> Release / Complete (Complete disabled until objectives met)
 *   completed -> none
 *   exit      -> Approve exit / Deny exit
 */
import PropTypes from 'prop-types';

const formatDate = (s) =>
    s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function EnrollmentRow({
    enrollment,
    variant,
    onApprove,
    onReject,
    onRelease,
    onComplete,
    onExitApprove,
    onExitDeny,
    isPending,
}) {
    // BE returns mentee_details (UserMinimalSerializer); legacy fallbacks kept for safety.
    const mentee = enrollment.mentee_details || enrollment.mentee || {};
    const fullName = `${mentee.first_name || ''} ${mentee.last_name || ''}`.trim();
    const menteeName = enrollment.mentee_name || fullName || mentee.email || 'Mentee';
    const initials = (fullName || mentee.email || 'M')
        .split(/\s+|@/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const messageText = enrollment.application_message || enrollment.message || 'No message';
    const allComplete = (enrollment.objectives_completed ?? 0) === (enrollment.objectives_count ?? 0)
        && (enrollment.objectives_count ?? 0) > 0;

    return (
        <div className="px-4 md:px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                {(mentee.profile_picture_url || mentee.profile_picture) ? (
                    <img src={mentee.profile_picture_url || mentee.profile_picture} alt={menteeName} className="w-full h-full rounded-xl object-cover" />
                ) : initials}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{menteeName}</p>
                <p className="text-xs text-slate-500 truncate">
                    {variant === 'pending' && messageText}
                    {variant === 'active' && `${enrollment.objectives_completed ?? 0}/${enrollment.objectives_count ?? 0} objectives complete`}
                    {variant === 'completed' && `Completed ${formatDate(enrollment.ended_at)}`}
                    {variant === 'exit' && (enrollment.exit_reason || 'Wants to leave the program')}
                </p>
            </div>

            <div className="hidden sm:block text-xs text-slate-500 whitespace-nowrap">
                {formatDate(enrollment.requested_at || enrollment.created_at)}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                {variant === 'pending' && (
                    <>
                        <button
                            onClick={() => onApprove(enrollment.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(enrollment)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                            Reject
                        </button>
                    </>
                )}
                {variant === 'active' && (
                    <>
                        <button
                            onClick={() => onComplete(enrollment.id)}
                            disabled={!allComplete || isPending}
                            title={!allComplete ? 'All objectives must be complete' : 'Mark this enrollment complete'}
                            className="px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                            Complete
                        </button>
                        <button
                            onClick={() => onRelease(enrollment)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors"
                        >
                            Release
                        </button>
                    </>
                )}
                {variant === 'exit' && (
                    <>
                        <button
                            onClick={() => onExitApprove(enrollment)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                            Approve Exit
                        </button>
                        <button
                            onClick={() => onExitDeny(enrollment)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                            Deny
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

EnrollmentRow.propTypes = {
    enrollment: PropTypes.object.isRequired,
    variant: PropTypes.oneOf(['pending', 'active', 'completed', 'exit']).isRequired,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    onRelease: PropTypes.func,
    onComplete: PropTypes.func,
    onExitApprove: PropTypes.func,
    onExitDeny: PropTypes.func,
    isPending: PropTypes.bool,
};
