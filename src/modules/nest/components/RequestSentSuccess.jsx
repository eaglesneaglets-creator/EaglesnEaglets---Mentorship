/**
 * RequestSentSuccess — Confirmation screen after sending a mentorship request
 *
 * Inspired by Image 12 — checkmark animation, request details summary, fade-in stagger.
 */
import PropTypes from 'prop-types';

const RequestSentSuccess = ({ nestName, mentorName, onClose }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Content */}
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 mx-4"
                style={{ animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Animated checkmark */}
                    <div className="relative mb-6">
                        {/* Outer ring pulse */}
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                        {/* Inner circle */}
                        <div
                            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/30"
                            style={{ animation: 'checkBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both' }}
                        >
                            <span
                                className="material-symbols-outlined text-white text-4xl"
                                style={{ animation: 'checkDraw 0.4s ease-out 0.5s both' }}
                            >
                                check
                            </span>
                        </div>
                    </div>

                    <h2
                        className="text-2xl font-extrabold text-slate-900 mb-2"
                        style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
                    >
                        Request Sent!
                    </h2>
                    <p
                        className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed"
                        style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
                    >
                        Your mentorship request has been sent successfully. {mentorName || 'The mentor'} will review and respond soon.
                    </p>

                    {/* Details card */}
                    <div
                        className="w-full bg-slate-50 rounded-xl border border-slate-200/60 p-5 mb-8 text-left space-y-3"
                        style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}
                    >
                        {nestName && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Nest</span>
                                <span className="text-sm font-semibold text-slate-800">{nestName}</span>
                            </div>
                        )}
                        {mentorName && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Mentor</span>
                                <span className="text-sm font-semibold text-slate-800">{mentorName}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Sent On</span>
                            <span className="text-sm font-semibold text-slate-800">{formattedDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Time</span>
                            <span className="text-sm font-semibold text-slate-800">{formattedTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Pending Review
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div
                        className="w-full space-y-3"
                        style={{ animation: 'fadeInUp 0.5s ease-out 0.6s both' }}
                    >
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                        >
                            Done
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Continue Browsing Mentors
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes checkBounce {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }
                @keyframes checkDraw {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

RequestSentSuccess.propTypes = {
    nestName: PropTypes.string,
    mentorName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default RequestSentSuccess;
