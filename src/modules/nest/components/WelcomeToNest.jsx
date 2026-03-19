/**
 * WelcomeToNest — Celebration screen shown after being approved to join a Nest
 *
 * Inspired by Image 13 — confetti feel, "Your First Steps" checklist, CTA buttons.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const FIRST_STEPS = [
    { id: 'profile', icon: 'person', label: 'Complete your profile', description: 'Add a photo and bio so your mentor can get to know you.' },
    { id: 'intro', icon: 'waving_hand', label: 'Introduce yourself', description: 'Post a brief introduction in the community feed.' },
    { id: 'content', icon: 'play_circle', label: 'Start your first lesson', description: 'Browse available content and begin learning.' },
    { id: 'goals', icon: 'flag', label: 'Set your goals', description: 'Define what you want to achieve in this mentorship.' },
];

const WelcomeToNest = ({ nestName, mentorName, nestId, onDismiss }) => {
    const [completedSteps, setCompletedSteps] = useState([]);

    const toggleStep = (id) => {
        setCompletedSteps(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const progress = (completedSteps.length / FIRST_STEPS.length) * 100;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Content */}
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 mx-4 max-h-[90vh] overflow-y-auto"
                style={{ animation: 'welcomeScale 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {/* Celebration header */}
                <div className="relative bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-8 text-center overflow-hidden">
                    {/* Decorative particles */}
                    <div className="absolute inset-0">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    left: `${10 + (i * 7) % 80}%`,
                                    top: `${15 + (i * 13) % 70}%`,
                                    backgroundColor: ['#FDE68A', '#FBCFE8', '#A5F3FC', '#C4B5FD', '#FCA5A5', '#86EFAC'][i % 6],
                                    animation: `confettiFloat ${2 + (i % 3)}s ease-in-out ${i * 0.2}s infinite alternate`,
                                    opacity: 0.7,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                            style={{ animation: 'welcomeBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both' }}
                        >
                            <span className="material-symbols-outlined text-white text-4xl">celebration</span>
                        </div>
                        <h2
                            className="text-2xl font-extrabold text-white mb-2"
                            style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
                        >
                            Welcome to the Nest!
                        </h2>
                        <p
                            className="text-sm text-white/80 max-w-xs mx-auto"
                            style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}
                        >
                            You&apos;ve been approved to join <span className="font-bold text-white">{nestName}</span>
                            {mentorName && <> with <span className="font-bold text-white">{mentorName}</span></>}
                        </p>
                    </div>
                </div>

                {/* First steps checklist */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Your First Steps</h3>
                        <span className="text-xs font-semibold text-primary">{completedSteps.length}/{FIRST_STEPS.length}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="space-y-3 mb-6">
                        {FIRST_STEPS.map((step, idx) => {
                            const isDone = completedSteps.includes(step.id);
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => toggleStep(step.id)}
                                    className={`
                                        w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-300
                                        ${isDone
                                            ? 'bg-primary/5 border-primary/20'
                                            : 'bg-white border-slate-200/60 hover:border-primary/20 hover:bg-slate-50'
                                        }
                                    `}
                                    style={{ animation: `fadeInUp 0.4s ease-out ${0.6 + idx * 0.1}s both` }}
                                >
                                    {/* Checkbox */}
                                    <div className={`
                                        w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300
                                        ${isDone
                                            ? 'bg-primary text-white'
                                            : 'border-2 border-slate-300'
                                        }
                                    `}>
                                        {isDone && (
                                            <span className="material-symbols-outlined text-sm">check</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${isDone ? 'text-primary line-through' : 'text-slate-800'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                                    </div>

                                    {/* Icon */}
                                    <span className={`material-symbols-outlined text-lg ${isDone ? 'text-primary' : 'text-slate-400'}`}>
                                        {step.icon}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            to={`/eaglet/nest/${nestId}`}
                            className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">explore</span>
                            Go to Your Nest
                        </Link>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                I&apos;ll explore later
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes welcomeScale {
                    from { transform: scale(0.85); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes welcomeBounce {
                    from { transform: scale(0) rotate(-20deg); }
                    to { transform: scale(1) rotate(0); }
                }
                @keyframes confettiFloat {
                    from { transform: translateY(0) rotate(0); }
                    to { transform: translateY(-12px) rotate(180deg); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

WelcomeToNest.propTypes = {
    nestName: PropTypes.string.isRequired,
    mentorName: PropTypes.string,
    nestId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onDismiss: PropTypes.func,
};

export default WelcomeToNest;
