import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useAssignmentDetail, useSubmitAssignment } from '../../modules/content/hooks/useContent';
import toast from 'react-hot-toast';

/* ─── Status Configs ─── */
const STATUS_MAP = {
    not_started: { label: 'Not Started', bg: 'bg-slate-100', text: 'text-slate-600' },
    in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700' },
    drafting:    { label: 'Drafting', bg: 'bg-amber-50', text: 'text-amber-700' },
    submitted:   { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-700' },
    graded:      { label: 'Graded', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    returned:    { label: 'Returned', bg: 'bg-red-50', text: 'text-red-700' },
};

/* ─── Soft animated background ─── */
const AnimatedBg = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-20 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl"
        />
        <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-green-100/20 rounded-full blur-3xl"
        />
    </div>
);

/* ─── Resource Item ─── */
const ResourceItem = ({ resource }) => {
    const isLink = resource.type === 'link' || resource.content_type === 'reading';
    const icon = isLink ? 'link' : 'description';
    const iconBg = isLink ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500';
    const name = resource.title || resource.name || 'Resource';
    const meta = resource.file_size
        ? `${(resource.file_size / (1024 * 1024)).toFixed(1)} MB`
        : isLink ? 'external site' : '';

    return (
        <a
            href={resource.url || resource.file_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
        >
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{name}</p>
                {meta && <p className="text-[11px] text-slate-400">{meta}</p>}
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-lg transition-colors">download</span>
        </a>
    );
};

/* ─── Main Page ─── */
const AssignmentDetailPage = () => {
    const { moduleId, itemId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);

    const { data: assignmentResponse, isLoading } = useAssignmentDetail(itemId);
    const submitMutation = useSubmitAssignment(itemId);

    const assignment = assignmentResponse?.data || assignmentResponse || {};

    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Submission state
    const latestSubmission = assignment.submissions?.[0] || assignment.latest_submission;
    const submissionStatus = latestSubmission?.status || assignment.status || 'not_started';
    const statusCfg = STATUS_MAP[submissionStatus] || STATUS_MAP.not_started;
    const isSubmitted = submissionStatus === 'submitted' || submissionStatus === 'graded';

    // Assignment ID badge
    const assignmentId = assignment.id ? `#ASG-${String(assignment.id).slice(-4).padStart(4, '0')}` : null;

    /* ─── File Handlers ─── */
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    };
    const handleFileSelect = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };
    const handleRemoveFile = () => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) { toast.error('Please attach a file to submit.'); return; }

        const payload = new FormData();
        payload.append('file', file);
        if (notes.trim()) payload.append('notes', notes.trim());

        submitMutation.mutate(payload, {
            onSuccess: () => { setFile(null); setNotes(''); setShowSuccess(true); }
        });
    };

    // moduleId is undefined on the standalone route (/eaglet/assignments/standalone/:itemId)
    const backPath = user?.role === 'eagle'
        ? (moduleId ? `/eagle/content/${moduleId}` : '/eagle/learning-center')
        : (moduleId ? `/eaglet/assignments/${moduleId}` : '/eaglet/assignments');

    return (
        <DashboardLayout variant={user?.role === 'eagle' ? 'eagle' : 'eaglet'}>
            <AnimatedBg />
            <div className="flex-1 w-full max-w-6xl mx-auto py-6 md:py-8 px-4 sm:px-6">

                {/* Back button */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <button onClick={() => navigate(backPath)}
                        className="group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        Back to Module
                    </button>
                </motion.div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin" />
                            <p className="text-slate-400 text-sm font-medium">Loading assignment...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ─── Header Card ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8 mb-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    {/* ID + Status */}
                                    <div className="flex items-center gap-2.5 mb-3">
                                        {assignmentId && (
                                            <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                                                ID: {assignmentId}
                                            </span>
                                        )}
                                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${statusCfg.bg} ${statusCfg.text}`}>
                                            {statusCfg.label}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                                        {assignment.title || 'Assignment'}
                                    </h1>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {assignment.file_url ? (
                                        <a
                                            href={assignment.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-primary/30 hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-base">download</span>
                                            Assignment
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </motion.div>

                        {/* ─── Two-Column Layout ─── */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                            {/* LEFT — Instructions + Resources (3 cols) */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-3 space-y-6"
                            >
                                {/* Full Instructions */}
                                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
                                    <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-[18px]">article</span>
                                        </span>
                                        Full Instructions
                                    </h2>
                                    <div className="prose prose-sm prose-slate max-w-none">
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[14px]">
                                            {assignment.description || 'No instructions have been provided for this assignment. Contact your mentor for details.'}
                                        </p>
                                    </div>

                                    {/* Key Requirements (if description has bullet points we show them) */}
                                    {assignment.requirements?.length > 0 && (
                                        <div className="mt-5">
                                            <h3 className="text-sm font-bold text-slate-900 mb-2">Key Requirements:</h3>
                                            <ul className="list-disc list-inside space-y-1.5">
                                                {assignment.requirements.map((req, i) => (
                                                    <li key={i} className="text-sm text-slate-600">{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Attached Resources */}
                                {(assignment.resources?.length > 0 || assignment.attachments?.length > 0) && (
                                    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
                                        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-emerald-600 text-[18px]">attach_file</span>
                                            </span>
                                            Attached Resources
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {(assignment.resources || assignment.attachments || []).map((res, i) => (
                                                <ResourceItem key={i} resource={res} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Previous Submission (if exists) */}
                                {latestSubmission && (
                                    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
                                        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-blue-600 text-[18px]">history</span>
                                            </span>
                                            Your Submission
                                        </h2>

                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary">description</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Submitted File</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {latestSubmission.submitted_at && new Date(latestSubmission.submitted_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {latestSubmission.file_url && (
                                                <a href={latestSubmission.file_url} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                                    View
                                                </a>
                                            )}
                                        </div>

                                        {/* Grade */}
                                        {latestSubmission.grade != null && (
                                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">grade</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-700">Grade: {latestSubmission.grade}%</p>
                                                    {latestSubmission.feedback && (
                                                        <p className="text-xs text-emerald-600/80 mt-0.5">{latestSubmission.feedback}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>

                            {/* RIGHT — Submit Your Work (2 cols) */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-2"
                            >
                                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sticky top-6">
                                    <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-[18px]">cloud_upload</span>
                                        </span>
                                        Submit Your Work
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* File Upload */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                                isDragging
                                                    ? 'border-primary bg-primary/5'
                                                    : file
                                                        ? 'border-primary/40 bg-primary/[0.02]'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

                                            {file ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary">description</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 truncate max-w-full">{file.name}</p>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                                        className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                        <span className="material-symbols-outlined text-slate-400 text-2xl">add</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">Upload files</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Drag and drop or browse files</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Message to Mentor */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Message to Mentor</label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={4}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                                                placeholder="Briefly describe your submission..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={submitMutation.isPending || !file || isSubmitted}
                                            className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                                        >
                                            {submitMutation.isPending ? (
                                                <><span className="material-symbols-outlined animate-spin text-base">sync</span> Submitting...</>
                                            ) : (
                                                'Submit Assignment'
                                            )}
                                        </motion.button>

                                        {/* Request Late Submission */}
                                        <button type="button"
                                            className="w-full py-2.5 text-primary text-sm font-semibold rounded-xl border border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-base">schedule</span>
                                            Request Late Submission
                                        </button>

                                        {/* Disclaimer */}
                                        <p className="text-[11px] text-slate-400 text-center leading-relaxed italic">
                                            By submitting, you agree that this work is your own and adheres to the platform's academic integrity policies.
                                        </p>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </div>

        {/* ─── Success Modal ─── */}
        <AnimatePresence>
            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowSuccess(false)}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
                    >
                        {/* Animated checkmark */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"
                        >
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="material-symbols-outlined text-emerald-600 text-4xl"
                            >
                                check_circle
                            </motion.span>
                        </motion.div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Submitted!</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Your assignment has been submitted successfully. Your mentor will review it and provide feedback soon.
                        </p>

                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                Done
                            </motion.button>
                            <button
                                onClick={() => { setShowSuccess(false); navigate(backPath); }}
                                className="w-full py-2.5 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
                            >
                                Back to Assignments
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        </DashboardLayout>
    );
};

export default AssignmentDetailPage;
