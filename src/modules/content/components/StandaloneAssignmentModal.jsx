import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateStandaloneAssignment } from '../hooks/useStandaloneAssignment';

const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

const StandaloneAssignmentModal = ({ isOpen, onClose, nestId }) => {
    const fileInputRef = useRef(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [pointsValue, setPointsValue] = useState(50);
    const [maxSubmissions, setMaxSubmissions] = useState(1);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const createMutation = useCreateStandaloneAssignment();

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('nest_id', nestId);
        formData.append('points_value', pointsValue);
        formData.append('max_submissions', maxSubmissions);
        if (dueDate) formData.append('due_date', new Date(dueDate).toISOString());
        if (file) formData.append('file', file);

        createMutation.mutate(formData, {
            onSuccess: () => {
                onClose();
                setTitle(''); setDescription(''); setDueDate(''); setFile(null);
                setPointsValue(50); setMaxSubmissions(1);
            },
        });
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
                    className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900">Send Assignment to Nest</h2>
                        <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-slate-500">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Title <span className="text-red-400">*</span></label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Assignment title..." className={inputClass} />
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Instructions <span className="text-red-400">*</span></label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                                rows={3} placeholder="Describe what eaglets should do..."
                                className={`${inputClass} resize-none`} />
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Attachment (optional)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : file ? 'border-primary/40 bg-primary/[0.02]' : 'border-slate-300 hover:border-slate-400'}`}
                            >
                                <input ref={fileInputRef} type="file" className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                                {file ? (
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">description</span>
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-slate-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">upload_file</span>
                                        <p className="text-xs text-slate-500 font-medium">PDF, DOC, PPTX supported</p>
                                        <p className="text-xs text-slate-400">Drag & drop or click to browse</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Due date + Points */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Due Date</label>
                                <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Points Value</label>
                                <input type="number" min="0" value={pointsValue}
                                    onChange={(e) => setPointsValue(Number(e.target.value))}
                                    className={inputClass} />
                            </div>
                        </div>

                        {/* Max submissions */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Max Submissions</label>
                            <input type="number" min="1" value={maxSubmissions}
                                onChange={(e) => setMaxSubmissions(Number(e.target.value))}
                                className={inputClass} />
                        </div>

                        {/* Footer */}
                        <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                            <button type="button" onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={createMutation.isPending}
                                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Sending...' : 'Send to Nest'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StandaloneAssignmentModal;
