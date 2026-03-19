import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateQuiz } from '../hooks/useModuleQuiz';

/* ─── Question row component ─── */
const QuestionRow = ({ question, index, onUpdate, onRemove }) => {
    const isMcq = question.question_type === 'mcq';

    const updateField = (field, value) => onUpdate(index, { ...question, [field]: value });
    const updateOption = (optIdx, value) => {
        const opts = [...(question.options || ['', '', '', ''])];
        opts[optIdx] = value;
        onUpdate(index, { ...question, options: opts });
    };

    return (
        <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q{index + 1}</span>
                <select
                    value={question.question_type}
                    onChange={(e) => onUpdate(index, {
                        ...question,
                        question_type: e.target.value,
                        options: e.target.value === 'mcq' ? ['', '', '', ''] : null,
                        correct_option: null,
                    })}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="mcq">MCQ</option>
                    <option value="descriptive">Descriptive</option>
                </select>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors ml-auto"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>

            <textarea
                value={question.question_text}
                onChange={(e) => updateField('question_text', e.target.value)}
                placeholder="Question text..."
                rows={2}
                className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            {isMcq ? (
                <div className="space-y-2">
                    {(question.options || ['', '', '', '']).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => updateField('correct_option', optIdx)}
                                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${question.correct_option === optIdx
                                    ? 'border-primary bg-primary'
                                    : 'border-slate-300 bg-white'
                                    }`}
                            >
                                {question.correct_option === optIdx && (
                                    <span className="material-symbols-outlined text-white text-[10px] w-full flex items-center justify-center">check</span>
                                )}
                            </button>
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    ))}
                    <p className="text-[10px] text-slate-400 pl-7">Click the circle to mark the correct answer</p>
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic pl-1">
                    Reflection only — eaglets write freely, not graded.
                </p>
            )}
        </div>
    );
};

/* ─── Modal ─── */
const ModuleQuizModal = ({ isOpen, onClose, moduleId, moduleName }) => {
    const [title, setTitle] = useState('');
    const [passScore, setPassScore] = useState(60);
    const [maxAttempts, setMaxAttempts] = useState(3);
    const [pointsValue, setPointsValue] = useState(50);
    const [questions, setQuestions] = useState([
        { question_type: 'mcq', question_text: '', options: ['', '', '', ''], correct_option: null },
    ]);

    const createQuizMutation = useCreateQuiz(moduleId);

    const addQuestion = (type = 'mcq') => {
        setQuestions(prev => [
            ...prev,
            type === 'mcq'
                ? { question_type: 'mcq', question_text: '', options: ['', '', '', ''], correct_option: null }
                : { question_type: 'descriptive', question_text: '', options: null, correct_option: null },
        ]);
    };

    const updateQuestion = (index, updated) => {
        setQuestions(prev => prev.map((q, i) => i === index ? updated : q));
    };

    const removeQuestion = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createQuizMutation.mutate(
            { title, pass_score: passScore, max_attempts: maxAttempts, points_value: pointsValue, questions },
            {
                onSuccess: () => {
                    onClose();
                    setTitle(''); setQuestions([{ question_type: 'mcq', question_text: '', options: ['', '', '', ''], correct_option: null }]);
                },
            }
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ scale: 0.95, y: 16 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Add Quiz</h2>
                            {moduleName && <p className="text-xs text-slate-400 mt-0.5">{moduleName}</p>}
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-slate-500">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                            {/* Quiz metadata */}
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Quiz title..."
                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Pass Score %</label>
                                    <input type="number" min="1" max="100" value={passScore}
                                        onChange={(e) => setPassScore(Number(e.target.value))}
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Max Attempts</label>
                                    <input type="number" min="1" value={maxAttempts}
                                        onChange={(e) => setMaxAttempts(Number(e.target.value))}
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Points Value</label>
                                    <input type="number" min="0" value={pointsValue}
                                        onChange={(e) => setPointsValue(Number(e.target.value))}
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            </div>

                            {/* Questions */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-700">Questions</h3>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => addQuestion('mcq')}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                            + MCQ
                                        </button>
                                        <button type="button" onClick={() => addQuestion('descriptive')}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                            + Descriptive
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {questions.map((q, i) => (
                                        <QuestionRow key={i} question={q} index={i} onUpdate={updateQuestion} onRemove={removeQuestion} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button type="button" onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={createQuizMutation.isPending}
                                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {createQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ModuleQuizModal;
