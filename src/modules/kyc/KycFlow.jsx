import { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plane, Loader2, ShieldCheck, Lightbulb, BadgeCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store';

import { mentorKycSchema, menteeKycSchema } from './schemas/kyc-schemas';
import { KycStepper, MENTOR_STEPS, MENTEE_STEPS } from './components/KycStepper';
import {
    IdentityStep, ProfessionalStep, BackgroundStep,
    MentorshipStep, DocumentsStep, ReviewStep,
} from './components/KycSteps';

const DRAFT_KEY = (role) => `kyc-draft-${role}`;

const WHY_COPY = {
    identity: "Identity verification keeps the nest safe. Your ID number is hashed and never shown to other members. We just confirm you're a real person.",
    professional: 'Eaglets pick mentors partly on professional fit. Specifics — role, years, industry — help us match well.',
    background: 'Timezone, language, and culture matter for mentorship. We use this to find Eagles who can actually meet with you.',
    mentorship: "Pick the areas you want to focus on. You can change these later — they're not a contract, just a starting signal.",
    documents: 'For Eagles, a CV helps our compliance team verify your claims quickly. Without it, review can take 2x longer.',
    review: 'Make sure everything is right. Once you submit, edits require contacting support.',
};

export default function KycFlow({ role, onSubmit, onComplete, defaultValues, initialPictureUrl }) {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const steps = role === 'mentor' ? MENTOR_STEPS : MENTEE_STEPS;

    const handleSignOut = async () => {
        await logout();
        navigate('/login', { replace: true });
    };
    const schema = role === 'mentor' ? mentorKycSchema : menteeKycSchema;

    const [stepIdx, setStepIdx] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [pictureUrl, setPictureUrl] = useState(initialPictureUrl || null);
    const [pictureFile, setPictureFile] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [idDocFile, setIdDocFile] = useState(null);
    const [savedAt, setSavedAt] = useState(null);

    const methods = useForm({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            full_name: '',
            national_id_number: '',
            marital_status: '',
            phone_number: '',
            employment_status: '',
            linkedin_url: '',
            mentorship_types: [],
            agree: false,
            ...(role === 'mentor'
                ? { location: '', profile_description: '' }
                : { country: '', city: '', bio: '' }),
            ...defaultValues,
        },
    });

    const { handleSubmit, watch, trigger } = methods;
    const watched = watch();

    useEffect(() => {
        const sub = methods.watch((values) => {
            try {
                sessionStorage.setItem(DRAFT_KEY(role), JSON.stringify(values));
                setSavedAt(new Date());
            } catch { /* ignore quota */ }
        });
        return () => sub.unsubscribe();
    }, [methods, role]);

    useEffect(() => {
        if (defaultValues) return;
        try {
            const saved = sessionStorage.getItem(DRAFT_KEY(role));
            if (saved) methods.reset(JSON.parse(saved));
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const completion = useMemo(() => {
        const required = role === 'mentor'
            ? ['full_name', 'national_id_number', 'marital_status', 'phone_number', 'location',
                'employment_status', 'profile_description', 'mentorship_types']
            : ['full_name', 'national_id_number', 'marital_status', 'country', 'city',
                'phone_number', 'employment_status', 'bio', 'mentorship_types'];

        const filled = required.filter((k) => {
            const v = watched[k];
            if (k === 'mentorship_types') return (v || []).length > 0;
            if (k === 'profile_description') return (v || '').trim().length >= 100;
            if (k === 'bio') return (v || '').trim().length >= 50;
            return !!v && (typeof v !== 'string' || v.trim());
        }).length;

        const num = filled + (pictureUrl ? 1 : 0) + (role === 'mentor' && cvFile ? 1 : 0);
        return Math.round((num / (required.length + 1 + (role === 'mentor' ? 1 : 0))) * 100);
    }, [watched, pictureUrl, cvFile, role]);

    const isLast = stepIdx === steps.length - 1;
    const currentStep = steps[stepIdx];

    const STEP_FIELDS = {
        identity: ['full_name', 'national_id_number', 'phone_number', 'marital_status'],
        professional: ['location', 'employment_status', 'profile_description'],
        background: ['country', 'city', 'employment_status', 'bio'],
        mentorship: ['mentorship_types'],
        documents: [],
        review: ['agree'],
    };

    const goNext = async () => {
        const fields = STEP_FIELDS[currentStep.id] || [];
        const ok = fields.length === 0 ? true : await trigger(fields);
        // Identity step also requires a profile photo (BE enforces — IncompleteProfile 400).
        if (currentStep.id === 'identity' && !pictureFile && !pictureUrl) {
            toast.error('Profile photo is required.');
            return;
        }
        if (ok) setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    };

    // Submit gate: BE requires picture + consent. Mirror that on FE.
    const agreeChecked = !!watch('agree');
    const hasPicture = !!pictureFile || !!pictureUrl;
    const canSubmit = !submitting && agreeChecked && hasPicture;

    const submit = handleSubmit(async (data) => {
        try {
            setSubmitting(true);
            await onSubmit?.(data, { picture: pictureFile, cv: cvFile, idDoc: idDocFile });
            sessionStorage.removeItem(DRAFT_KEY(role));
            setSubmitted(true);
        } catch (err) {
            toast.error(err.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    });

    if (submitted) return <KycSuccess role={role} onClose={() => (onComplete ? onComplete() : navigate('/pending-approval'))} />;

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-red-600 transition"
                        >
                            <LogOut className="w-4 h-4" /> Sign out
                        </button>
                        <div className="text-center flex-1 min-w-0 px-4">
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
                                {role === 'mentor' ? 'Become an Eagle' : 'Join the Nest'}
                            </p>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                                Earn Your Wings
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saving…'}
                        </div>
                    </header>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                            <span className="text-sm font-black text-primary">{completion}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                animate={{ width: `${completion}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <KycStepper steps={steps} currentIndex={stepIdx} onStepClick={setStepIdx} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep.id}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    {currentStep.id === 'identity' && (
                                        <IdentityStep
                                            pictureUrl={pictureUrl}
                                            onPictureChange={(url, file) => { setPictureUrl(url); setPictureFile(file); }}
                                        />
                                    )}
                                    {currentStep.id === 'professional' && <ProfessionalStep />}
                                    {currentStep.id === 'background' && <BackgroundStep />}
                                    {currentStep.id === 'mentorship' && <MentorshipStep role={role} />}
                                    {currentStep.id === 'documents' && (
                                        <DocumentsStep
                                            cvFile={cvFile} onCvChange={setCvFile}
                                            idDocFile={idDocFile} onIdDocChange={setIdDocFile}
                                        />
                                    )}
                                    {currentStep.id === 'review' && <ReviewStep role={role} cvFile={cvFile} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <aside className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                                    <Lightbulb className="w-4 h-4" /> Why we ask
                                </div>
                                <p className="text-sm text-amber-900 leading-relaxed">{WHY_COPY[currentStep.id]}</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                    <ShieldCheck className="w-4 h-4" /> Privacy
                                </div>
                                <p className="text-sm text-emerald-900 leading-relaxed">
                                    Documents are encrypted with AES-256 at rest and only viewed by our compliance team.
                                    Never shared with mentors, mentees, or third parties.
                                </p>
                            </div>
                        </aside>
                    </div>

                    <footer className="flex items-center justify-between mt-6 gap-3 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setStepIdx((i) => Math.max(i - 1, 0))}
                            disabled={stepIdx === 0}
                            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <span className="text-xs text-slate-500">Step {stepIdx + 1} of {steps.length}</span>
                        {!isLast ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submit}
                                disabled={!canSubmit}
                                title={!hasPicture ? 'Profile photo is required.' : !agreeChecked ? 'Please agree to the terms below.' : ''}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                                ) : (
                                    <>{role === 'mentor' ? 'Apply to Mentor' : 'Join the Nest'} <Plane className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </FormProvider>
    );
}

function KycSuccess({ role, onClose }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center shadow-xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
                    className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30 mb-5"
                >
                    <BadgeCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                    {role === 'mentor' ? 'Welcome, Eagle.' : 'Welcome, Eaglet.'}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {role === 'mentor'
                        ? "We'll review your application within 1–3 business days and email you when you're cleared."
                        : "Your profile is in review. We'll notify you within 1–3 business days once approved, then start matching you with Eagles."}
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition"
                >
                    Check approval status <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
}
