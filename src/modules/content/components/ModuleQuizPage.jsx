import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useGetQuiz, useSubmitAttempt, useAttemptHistory } from '../hooks/useModuleQuiz';

/* ─── MCQ question ─── */
const MCQQuestion = ({ question, answer, onChange }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <p className="text-sm font-bold text-slate-800">{question.question_text}</p>
        <div className="space-y-2">
            {(question.options || []).map((opt, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(String(question.id), idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${answer === idx
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                        }`}
                >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

/* ─── Descriptive question ─── */
const DescriptiveQuestion = ({ question, answer, onChange }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <p className="text-sm font-bold text-slate-800">{question.question_text}</p>
        <p className="text-xs text-slate-400 italic">Reflection — not graded</p>
        <textarea
            value={answer || ''}
            onChange={(e) => onChange(String(question.id), e.target.value)}
            rows={4}
            placeholder="Write your thoughts..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
    </div>
);

/* ─── Results screen ─── */
const ResultsScreen = ({ result, quiz, onRetry, onDone }) => {
    const passed = result.passed;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-12"
        >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${passed ? 'bg-primary/10' : 'bg-red-50'}`}>
                <span className={`material-symbols-outlined text-4xl ${passed ? 'text-primary' : 'text-red-500'}`}>
                    {passed ? 'check_circle' : 'cancel'}
                </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
                {passed ? 'You Passed!' : 'Not Quite'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
                You scored <span className={`font-bold ${passed ? 'text-primary' : 'text-red-500'}`}>{result.score}%</span>
                {result.total_mcq > 0 && ` — ${result.correct_count}/${result.total_mcq} correct`}
            </p>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Pass score</span>
                    <span className="font-bold">{quiz?.pass_score}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Attempt</span>
                    <span className="font-bold">#{result.attempt_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Attempts remaining</span>
                    <span className="font-bold">{result.attempts_remaining}</span>
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                {!passed && result.attempts_remaining > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={onRetry}
                        className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90"
                    >
                        Retry Quiz
                    </motion.button>
                )}
                <button onClick={onDone} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">
                    {passed ? 'Continue' : 'Back'}
                </button>
            </div>
        </motion.div>
    );
};

/* ─── Main page ─── */
const ModuleQuizPage = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const { data: quizResponse, isLoading } = useGetQuiz(moduleId);
    const submitMutation = useSubmitAttempt(moduleId);
    const { data: attemptsResponse } = useAttemptHistory(moduleId);

    const quiz = quizResponse?.data;
    const attempts = attemptsResponse?.data || [];
    const attemptsUsed = quiz?.attempts_used ?? attempts.length;
    const attemptsRemaining = quiz ? (quiz.max_attempts - attemptsUsed) : 0;
    const isExhausted = attemptsRemaining <= 0 && !result;

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitMutation.mutate(answers, {
            onSuccess: (response) => {
                setResult(response?.data);
            },
        });
    };

    const handleRetry = () => {
        setResult(null);
        setAnswers({});
    };

    const layoutVariant = user?.role === 'eagle' ? 'eagle' : 'eaglet';

    if (isLoading) return (
        <DashboardLayout variant={layoutVariant}>
            <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
            </div>
        </DashboardLayout>
    );

    if (!quiz) return (
        <DashboardLayout variant={layoutVariant}>
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-3">quiz</span>
                <p>No quiz found for this module.</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout variant={layoutVariant}>
            <div className="flex-1 w-full max-w-2xl mx-auto py-8 px-4">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6 transition-colors"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to module
                </button>

                <AnimatePresence mode="wait">
                    {result ? (
                        <ResultsScreen
                            key="results"
                            result={result}
                            quiz={quiz}
                            onRetry={handleRetry}
                            onDone={() => navigate(-1)}
                        />
                    ) : (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Quiz header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-amber-500">quiz</span>
                                    <h1 className="text-xl font-black text-slate-900">{quiz.title}</h1>
                                </div>
                                <div className="flex gap-4 text-xs text-slate-400">
                                    <span>{quiz.questions?.length} question{quiz.questions?.length !== 1 ? 's' : ''}</span>
                                    <span>Pass at {quiz.pass_score}%</span>
                                    <span>{attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining</span>
                                </div>
                            </div>

                            {isExhausted ? (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                    <span className="material-symbols-outlined text-red-400 text-3xl mb-2 block">block</span>
                                    <p className="font-bold text-red-700">No attempts remaining</p>
                                    <p className="text-sm text-red-500 mt-1">You've used all {quiz.max_attempts} attempts for this quiz.</p>
                                    <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
                                        Go Back
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {quiz.questions?.map((q) => (
                                        q.question_type === 'mcq' ? (
                                            <MCQQuestion
                                                key={q.id}
                                                question={q}
                                                answer={answers[String(q.id)]}
                                                onChange={handleAnswer}
                                            />
                                        ) : (
                                            <DescriptiveQuestion
                                                key={q.id}
                                                question={q}
                                                answer={answers[String(q.id)]}
                                                onChange={handleAnswer}
                                            />
                                        )
                                    ))}

                                    <div className="pt-4 flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={submitMutation.isPending}
                                            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
                                        >
                                            {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
                                        </motion.button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default ModuleQuizPage;
