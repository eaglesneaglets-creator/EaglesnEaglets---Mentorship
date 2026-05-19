/* eslint-disable react-refresh/only-export-components */
import { Badge, Briefcase, User, Rocket, FileText, ClipboardCheck } from 'lucide-react';

export const MENTOR_STEPS = [
    { id: 'identity', label: 'Identity', icon: Badge },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'mentorship', label: 'Mentorship', icon: Rocket },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'review', label: 'Review', icon: ClipboardCheck },
];

export const MENTEE_STEPS = [
    { id: 'identity', label: 'Identity', icon: Badge },
    { id: 'background', label: 'Background', icon: User },
    { id: 'mentorship', label: 'Goals', icon: Rocket },
    { id: 'review', label: 'Review', icon: ClipboardCheck },
];

export const KycStepper = ({ steps, currentIndex, onStepClick }) => {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === currentIndex;
                const isDone = i < currentIndex;

                return (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => onStepClick?.(i)}
                        className={[
                            'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition shrink-0',
                            isActive
                                ? 'bg-primary/10 border-primary'
                                : isDone
                                    ? 'bg-primary/5 border-primary/30'
                                    : 'bg-white border-slate-200 hover:border-slate-300',
                        ].join(' ')}
                    >
                        <div
                            className={[
                                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                                isActive ? 'bg-primary text-white' : isDone ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500',
                            ].join(' ')}
                        >
                            <Icon className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Step {i + 1}
                            </div>
                            <div className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                                {step.label}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
