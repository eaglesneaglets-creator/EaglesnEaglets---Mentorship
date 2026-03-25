import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { formatDate } from '../../shared/utils';
import { useSubmissions, useGradeSubmission } from '../../modules/content/hooks/useContent';
import StatCard from '../../shared/components/ui/StatCard';
import { stripCloudinarySignature } from '../../shared/utils/sanitize';

/* ─── Soft animated background blobs ─── */
const AnimatedBg = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 right-[10%] w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl"
        />
        <motion.div
            animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 left-[5%] w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-3xl"
        />
    </div>
);

/* ─── Grading Modal ─── */
const GradingModal = ({ submission, onClose, onGrade, isSubmitting }) => {
    const isAlreadyGraded = submission.status === 'graded';

    const gradeLabel = {
        A: 'A — Excellent',
        B: 'B — Good',
        C: 'C — Satisfactory',
        'Needs Revision': 'Needs Revision',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
        >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                {isAlreadyGraded ? 'Submission Details' : 'Grade Submission'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                Reviewing {submission.user?.first_name} {submission.user?.last_name}'s work
                            </p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Assignment Info */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assignment Details</h3>
                            <p className="font-bold text-slate-700">{submission.assignment?.title}</p>
                            {submission.assignment?.nest_name && (
                                <p className="text-xs text-slate-500 mt-0.5">Nest: {submission.assignment.nest_name}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">{submission.assignment?.points_value || 0} points available</p>
                        </div>

                        {/* Submission Notes */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Submission Notes</label>
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 max-h-40 overflow-y-auto">
                                {submission.notes || 'No notes provided.'}
                            </div>
                        </div>

                        {/* File Attachment */}
                        {submission.file_url && (
                            <a
                                href={stripCloudinarySignature(submission.file_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl text-primary hover:bg-primary/10 transition-all group"
                            >
                                <span className="material-symbols-outlined">description</span>
                                <span className="text-sm font-bold flex-1">View Attached File</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">open_in_new</span>
                            </a>
                        )}

                        {/* ── Already graded: show recorded grade + feedback ── */}
                        {isAlreadyGraded ? (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Grade</p>
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700">
                                            {gradeLabel[submission.grade] || submission.grade || '—'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Graded by</p>
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600">
                                            {submission.graded_by
                                                ? `${submission.graded_by.first_name} ${submission.graded_by.last_name}`
                                                : 'You'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Feedback given</p>
                                    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 min-h-[80px]">
                                        {submission.feedback || 'No feedback recorded.'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            /* ── Not yet graded: show grading form ── */
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                onGrade({
                                    grade: formData.get('grade'),
                                    feedback: formData.get('feedback'),
                                });
                            }} className="space-y-6 pt-4 border-t border-slate-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grade</label>
                                        <select name="grade" required className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 text-sm font-bold appearance-none bg-white">
                                            <option value="">Select Grade</option>
                                            <option value="A">A — Excellent</option>
                                            <option value="B">B — Good</option>
                                            <option value="C">C — Satisfactory</option>
                                            <option value="Needs Revision">Needs Revision</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Points</label>
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400">
                                            {submission.assignment?.points_value || 0} pts on completion
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Feedback</label>
                                    <textarea
                                        name="feedback"
                                        placeholder="Provide specific guidance to help them grow..."
                                        required
                                        className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 text-sm min-h-[120px]"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={onClose} className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-4 px-6 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Submitting…' : 'Submit Grade'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const GradingCenterPage = () => {
    const [statusFilter, setStatusFilter] = useState('submitted');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const { data: submissionsData, isLoading } = useSubmissions({ status: statusFilter !== 'all' ? statusFilter : undefined });
    const gradeMutation = useGradeSubmission();

    const submissions = submissionsData?.data || [];

    const handleGrade = async (data) => {
        try {
            await gradeMutation.mutateAsync({
                assignmentId: selectedSubmission.assignment.id,
                submissionId: selectedSubmission.id,
                data,
            });
            setSelectedSubmission(null);
        } catch {
            // error toast is handled by useGradeSubmission onError
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        return (
            s.user?.first_name?.toLowerCase().includes(query) ||
            s.user?.last_name?.toLowerCase().includes(query) ||
            s.assignment?.title?.toLowerCase().includes(query)
        );
    });

    return (
        <DashboardLayout variant="eagle">
            <AnimatedBg />

            <div className="flex-1 w-full max-w-[1200px] mx-auto py-6 md:py-8 lg:px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Mentor Hub
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Grading Center
                        </h1>
                        <p className="text-slate-500 max-w-md">
                            Review submissions, provide detailed feedback, and award points to your Eaglets.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search by name or task..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-64 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard label="Pending" value={submissions.filter(s => s.status === 'submitted').length} icon="pending_actions" colorClass="bg-amber-50 text-amber-600" />
                    <StatCard label="Completed" value={submissions.filter(s => s.status === 'graded').length} icon="done_all" colorClass="bg-emerald-50 text-emerald-600" />
                    <StatCard label="Eaglets" value={new Set(submissions.map(s => s.user?.id)).size} icon="group" colorClass="bg-blue-50 text-blue-600" />
                    <StatCard label="Points Avg" value="85" icon="stars" colorClass="bg-purple-50 text-purple-600" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-slate-200/50 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[500px]">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 px-8">
                        {[
                            { key: 'submitted', label: 'Needs Review' },
                            { key: 'graded', label: 'Completed' },
                            { key: 'all', label: 'All History' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`relative py-6 px-4 text-sm font-bold transition-all ${statusFilter === tab.key ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab.label}
                                {statusFilter === tab.key && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Submissions List */}
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-slate-400">Loading submissions...</p>
                            </div>
                        ) : filteredSubmissions.length > 0 ? (
                            <div className="overflow-x-auto px-4">
                                <table className="w-full text-left border-separate border-spacing-y-3">
                                    <thead className="text-slate-400 text-[11px] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-2">Eaglet</th>
                                            <th className="px-4 py-2">Assignment</th>
                                            <th className="px-4 py-2">Nest</th>
                                            <th className="px-4 py-2">Submitted</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {filteredSubmissions.map((sub) => (
                                                <motion.tr
                                                    key={sub.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group hover:bg-slate-50 transition-all"
                                                >
                                                    <td className="px-4 py-4 rounded-l-2xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs border border-white shadow-sm">
                                                                {sub.user?.first_name?.charAt(0)}{sub.user?.last_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{sub.user?.first_name} {sub.user?.last_name}</p>
                                                                <p className="text-[11px] text-slate-400 font-medium">{sub.user?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-slate-700">{sub.assignment?.title}</p>
                                                            {sub.assignment?.assignment_type === 'standalone' && (
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-md">
                                                                    Standalone
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">
                                                            {sub.assignment?.nest_name || 'Nest'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-xs font-medium text-slate-500">
                                                        {formatDate(sub.submitted_at)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sub.status === 'submitted'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                            {sub.status === 'submitted' ? 'Pending' : `Graded (${sub.grade})`}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 rounded-r-2xl text-right">
                                                        <button
                                                            onClick={() => setSelectedSubmission(sub)}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm group-hover:shadow-md"
                                                        >
                                                            {sub.status === 'submitted' ? 'Review & Grade' : 'View Details'}
                                                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-32 text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                    <span className="material-symbols-outlined text-5xl">inventory</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Queue is empty</h3>
                                <p className="text-slate-400 mt-2">No submissions found for the current filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Layer */}
            <AnimatePresence>
                {selectedSubmission && (
                    <GradingModal
                        submission={selectedSubmission}
                        onClose={() => setSelectedSubmission(null)}
                        onGrade={handleGrade}
                        isSubmitting={gradeMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default GradingCenterPage;
