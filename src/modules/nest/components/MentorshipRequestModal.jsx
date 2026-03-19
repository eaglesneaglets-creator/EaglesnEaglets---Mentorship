/**
 * MentorshipRequestModal — Send a join request to a mentor's Nest
 *
 * Inspired by Image 11 — modal with suggested prompts, character counter, slide-up animation.
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useJoinNest } from '../hooks/useNests';
import RequestSentSuccess from './RequestSentSuccess';

const SUGGESTED_PROMPTS = [
    "I'm eager to learn and grow in this field.",
    "I've been following your work and would love to be mentored by you.",
    "I'm looking for structured guidance to advance my career.",
    "I'm passionate about this area and ready to commit to the program.",
];

const MAX_CHARS = 500;

const MentorshipRequestModal = ({ nestId, nestName, mentorName, onClose }) => {
    const [message, setMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const joinMutation = useJoinNest(nestId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await joinMutation.mutateAsync(message.trim());
            setShowSuccess(true);
        } catch {
            // Error handled by React Query
        }
    };

    const handlePromptClick = (prompt) => {
        setMessage(prev => {
            const newMsg = prev ? `${prev} ${prompt}` : prompt;
            return newMsg.slice(0, MAX_CHARS);
        });
    };

    if (showSuccess) {
        return (
            <RequestSentSuccess
                nestName={nestName}
                mentorName={mentorName}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
                style={{
                    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900">Request to Join</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Send a message to <span className="font-semibold text-slate-700">{mentorName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all duration-200"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6">
                    {/* Nest info chip */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <span className="material-symbols-outlined text-primary text-lg">diversity_3</span>
                        <span className="text-sm font-semibold text-primary">{nestName}</span>
                    </div>

                    {/* Message textarea */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Your Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                            placeholder="Tell the mentor why you'd like to join their nest..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        <div className="flex justify-end mt-1.5">
                            <span className={`text-xs font-medium ${message.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                                {message.length}/{MAX_CHARS}
                            </span>
                        </div>
                    </div>

                    {/* Suggested prompts */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">
                            Suggested prompts
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/60 rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-200 active:scale-95"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error message */}
                    {joinMutation.isError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200/60 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                            <p className="text-sm text-red-700">
                                {joinMutation.error?.message || 'Failed to send request. Please try again.'}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!message.trim() || joinMutation.isPending}
                            className={`
                                flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300
                                inline-flex items-center justify-center gap-2
                                ${!message.trim() || joinMutation.isPending
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
                                }
                            `}
                        >
                            {joinMutation.isPending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                    Send Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

MentorshipRequestModal.propTypes = {
    nestId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nestName: PropTypes.string,
    mentorName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default MentorshipRequestModal;
