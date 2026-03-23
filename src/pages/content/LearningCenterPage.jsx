import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useModules, useMyProgress, useDeleteModule } from '../../modules/content/hooks/useContent';
import { useMyNests } from '../../modules/nest/hooks/useNests';
import { useMyStandaloneAssignments } from '../../modules/content/hooks/useStandaloneAssignment';
import ContentItemUploadModal from '../../modules/content/components/ContentItemUploadModal';
import ContentEditModal from '../../modules/content/components/ContentEditModal';
import ModuleQuizModal from '../../modules/content/components/ModuleQuizModal';
import StandaloneAssignmentModal from '../../modules/content/components/StandaloneAssignmentModal';
import { formatDate } from '../../shared/utils';

/* ─── Constants ─── */
const TYPE_FILTERS = [
    { key: 'all', label: 'All Types' },
    { key: 'video', label: 'Videos' },
    { key: 'document', label: 'Documents' },
    { key: 'reading', label: 'Links' },
];

const STATUS_FILTERS = [
    { key: 'all', label: 'All Status' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
];

const EAGLET_TABS = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
];

const TYPE_META = {
    video: { label: 'VIDEO CONTENT', icon: 'play_circle', color: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    document: { label: 'DOCUMENT', icon: 'description', color: 'text-blue-600', iconBg: 'bg-blue-50' },
    reading: { label: 'EXTERNAL RESOURCE', icon: 'link', color: 'text-violet-600', iconBg: 'bg-violet-50' },
    quiz: { label: 'QUIZ', icon: 'quiz', color: 'text-amber-600', iconBg: 'bg-amber-50' },
};

/* ─── Soft animated background blobs ─── */
const AnimatedBg = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
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

/* ─── Content Card (Eagle/Admin — matches "My Uploads" screenshot) ─── */
const ContentCard = ({ module, onClick, onAddItem, onEdit, onDelete, onAddQuiz, delay = 0 }) => {
    const typeMeta = TYPE_META[module.primary_type] || TYPE_META.document;
    const isPublished = module.is_published;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay * 0.06 }}
            onClick={onClick}
            className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/70 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
        >
            {/* Thumbnail area */}
            <div className="relative h-44 bg-slate-50 overflow-hidden">
                {module.thumbnail_url ? (
                    <img src={module.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <span className={`material-symbols-outlined text-5xl text-slate-300`}>{typeMeta.icon}</span>
                    </div>
                )}
                {/* Status badge — top right */}
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${isPublished
                    ? 'bg-primary text-white'
                    : 'bg-amber-500 text-white'
                    }`}>
                    {isPublished ? 'Published' : 'Draft'}
                </span>
                {/* Duration badge (video) */}
                {module.primary_type === 'video' && module.duration && (
                    <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {module.duration}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4 pt-3">
                {/* Type label */}
                <div className="flex items-center gap-1.5 mb-2">
                    <span className={`material-symbols-outlined text-sm ${typeMeta.color}`}>{typeMeta.icon}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${typeMeta.color}`}>{typeMeta.label}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                    {module.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">
                    {module.created_at && `Uploaded on ${formatDate(module.created_at)}`}
                    {module.nest_name && ` · Assigned: ${module.nest_name}`}
                </p>

                {/* Quiz badge */}
                {module.has_quiz && (
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">quiz</span>
                            Quiz attached
                        </span>
                    </div>
                )}

                {/* Footer — action icons */}
                <div className="mt-auto pt-3 flex items-center gap-1.5 border-t border-slate-100 mt-3">
                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} title="Edit"
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 flex items-center justify-center transition-colors group/btn">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover/btn:text-primary">edit</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAddQuiz?.(); }} title={module.has_quiz ? "Edit Quiz" : "Add Quiz"}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-amber-50 flex items-center justify-center transition-colors group/btn">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover/btn:text-amber-500">quiz</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAddItem?.(); }} title="Analytics"
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 flex items-center justify-center transition-colors group/btn">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover/btn:text-primary">bar_chart</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} title="Delete"
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors group/btn ml-auto">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover/btn:text-red-500">delete</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Upload Card (dashed, "Add More Content") ─── */
const UploadCard = ({ onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className="group flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-300 min-h-[340px] cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300"
    >
        <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300">
            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">add</span>
        </div>
        <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Add More Content</p>
        <p className="text-xs text-slate-400 mt-1">Files up to 500MB supported</p>
    </motion.div>
);

/* ─── Assignment Card (Eaglet — matches "My Assignments" screenshot) ─── */
const AssignmentCard = ({ module, onClick, onTakeQuiz, delay = 0 }) => {
    const progress = module.progress || module.completion_percentage || 0;
    const isCompleted = progress >= 100 || module.status === 'completed';
    const hasQuiz = module.has_quiz;
    const quizUnlocked = module.resource_gate_cleared;
    const isOverdue = module.is_overdue;
    const mentor = module.eagle_details || module.mentor || {};
    const mentorName = mentor.first_name
        ? `${mentor.first_name} ${mentor.last_name || ''}`.trim()
        : module.eagle_name || '';

    const dueDate = module.due_date ? new Date(module.due_date) : null;
    const finishedDate = module.completed_at ? new Date(module.completed_at) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay * 0.06 }}
            className="group relative bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
            {/* Thumbnail area for Assignment */}
            <div className="relative h-40 bg-slate-50 overflow-hidden">
                {module.thumbnail_url ? (
                    <img src={module.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-emerald-50/10">
                        <span className="material-symbols-outlined text-4xl text-primary/20">assignment</span>
                    </div>
                )}
                {/* Status badge — top right */}
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${isCompleted
                    ? 'bg-primary text-white'
                    : isOverdue
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                    {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'In Progress'}
                </span>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {module.title}
                    </h3>
                    <button className="p-1 text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                </div>

                {/* Meta — mentor + date */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-4">
                    {mentorName && (
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {mentorName}
                        </span>
                    )}
                    {(dueDate || finishedDate) && (
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {isCompleted && finishedDate
                                ? `Finished ${finishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                : dueDate
                                    ? `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                    : ''
                            }
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-500">Progress</span>
                        <span className={`text-xs font-bold ${isCompleted ? 'text-primary' : 'text-primary'}`}>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: delay * 0.06 }}
                            className={`h-full rounded-full ${isCompleted ? 'bg-primary' : 'bg-gradient-to-r from-primary to-emerald-400'}`}
                        />
                    </div>
                </div>

                {/* CTA row */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClick}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${isCompleted
                            ? 'bg-white border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
                            }`}
                    >
                        {isCompleted ? 'Review Feedback' : (
                            <>View Details <span className="material-symbols-outlined text-base">arrow_forward</span></>
                        )}
                    </motion.button>
                    {hasQuiz && (
                        <motion.button
                            whileHover={quizUnlocked ? { scale: 1.01 } : {}}
                            whileTap={quizUnlocked ? { scale: 0.98 } : {}}
                            onClick={quizUnlocked ? onTakeQuiz : undefined}
                            title={quizUnlocked ? 'Take Quiz' : 'Complete 50% of resources first'}
                            className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1 transition-all ${quizUnlocked
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <span className="material-symbols-outlined text-base">quiz</span>
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Progress Ring (Eaglet bottom cards) ─── */
const ProgressRing = ({ progress, size = 64, strokeWidth = 5 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                strokeWidth={strokeWidth} className="stroke-slate-200" />
            <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                strokeWidth={strokeWidth} strokeLinecap="round"
                className="stroke-primary"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
    );
};

/* ─── Standalone Assignment Card (eaglet view) ─── */
const StandaloneTaskCard = ({ assignment, index }) => {
    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
    const submissionStatus = assignment.my_submission_status;
    const isSubmitted = submissionStatus === 'submitted' || submissionStatus === 'graded';
    const isReturned = submissionStatus === 'returned';

    const dueDateLabel = assignment.due_date
        ? isOverdue && !isSubmitted
            ? `Overdue · ${formatDate(assignment.due_date)}`
            : `Due ${formatDate(assignment.due_date)}`
        : 'No due date';

    const accentColor = isSubmitted
        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
        : isReturned
            ? 'bg-gradient-to-r from-orange-400 to-red-400'
            : isOverdue
                ? 'bg-red-400'
                : 'bg-gradient-to-r from-amber-400 to-orange-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
            <div className={`h-1.5 ${accentColor}`} />
            <div className="p-5 flex flex-col flex-1 gap-3">
                {/* Meta */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Assignment
                    </span>
                    {isSubmitted ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px]">check_circle</span>
                            {submissionStatus === 'graded' ? 'Graded' : 'Submitted'}
                        </span>
                    ) : isReturned ? (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">Returned</span>
                    ) : assignment.nest_name ? (
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{assignment.nest_name}</span>
                    ) : null}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {assignment.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
                    {assignment.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className={`flex items-center gap-1 font-medium ${isOverdue && !isSubmitted ? 'text-red-500' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-sm">{isOverdue && !isSubmitted ? 'warning' : 'schedule'}</span>
                        {dueDateLabel}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-amber-500">psychiatry</span>
                        {assignment.points_value} pts
                    </span>
                </div>

                {/* CTA */}
                <Link
                    to={`/eaglet/assignments/standalone/${assignment.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-1 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-colors duration-200 ${
                        isSubmitted
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-900 text-white hover:bg-primary'
                    }`}
                >
                    {isSubmitted ? 'View Submission' : 'View & Submit'}
                    <span className="material-symbols-outlined text-sm">{isSubmitted ? 'visibility' : 'arrow_forward'}</span>
                </Link>
            </div>
        </motion.div>
    );
};

/* ─── Main Page ─── */
const LearningCenterPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [activeTypeFilter, setActiveTypeFilter] = useState('all');
    const [activeStatusFilter, setActiveStatusFilter] = useState('all');
    const [activeEagletTab, setActiveEagletTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModuleIdToUpload, setActiveModuleIdToUpload] = useState(null);
    const [moduleToEdit, setModuleToEdit] = useState(null);
    const [quizModuleId, setQuizModuleId] = useState(null);
    const [quizModuleName, setQuizModuleName] = useState('');
    const [showStandaloneModal, setShowStandaloneModal] = useState(false);

    const [activeSection, setActiveSection] = useState('modules'); // 'modules' | 'tasks'

    const isEagleOrAdmin = user?.role === 'eagle' || user?.role === 'admin';
    const variant = user?.role === 'eagle' ? 'eagle' : user?.role === 'admin' ? 'admin' : 'eaglet';

    // Standalone assignments (eaglet only)
    const { data: tasksResponse, isLoading: tasksLoading } = useMyStandaloneAssignments();
    const allStandaloneAssignments = useMemo(
        () => tasksResponse?.data || tasksResponse?.results || [],
        [tasksResponse]
    );

    // Apply the same eaglet tab filter to assignments
    const standaloneAssignments = useMemo(() => {
        if (activeEagletTab === 'all') return allStandaloneAssignments;
        if (activeEagletTab === 'completed')
            return allStandaloneAssignments.filter(a =>
                a.my_submission_status === 'submitted' || a.my_submission_status === 'graded'
            );
        if (activeEagletTab === 'in_progress')
            return allStandaloneAssignments.filter(a =>
                !a.my_submission_status || a.my_submission_status === 'returned'
            );
        if (activeEagletTab === 'overdue')
            return allStandaloneAssignments.filter(a =>
                a.due_date && new Date(a.due_date) < new Date() &&
                a.my_submission_status !== 'submitted' && a.my_submission_status !== 'graded'
            );
        return allStandaloneAssignments;
    }, [allStandaloneAssignments, activeEagletTab]);

    // Data
    const { data: myNestsResponse } = useMyNests();
    const nestId = myNestsResponse?.data?.[0]?.id || myNestsResponse?.data?.results?.[0]?.id || user?.nest_id;

    // FOR ADMINS/EAGLES: Fetch everything they uploaded (all visibilities)
    // FOR EAGLETS: Fetch nest_only modules (Learning Modules / Assignments view)
    const modulesQuery = isEagleOrAdmin
        ? { created_by: user.id }
        : { nest: nestId, visibility: 'nest_only' };

    const { data: modulesResponse, isLoading } = useModules(modulesQuery);
    const { data: progressResponse } = useMyProgress();

    const modules = useMemo(
        () => modulesResponse?.data || modulesResponse?.results || [],
        [modulesResponse]
    );
    const pData = progressResponse?.data || {};
    const overallProgress = Math.round(pData.average_progress ?? pData.overall_progress ?? 0);

    const deleteModuleMutation = useDeleteModule();

    const handleDeleteModule = (module) => {
        if (window.confirm(`Are you sure you want to delete "${module.title}"? This will also remove all items within it.`)) {
            deleteModuleMutation.mutate(module.id);
        }
    };

    // Filtering
    const filteredModules = useMemo(() => {
        let result = modules;
        if (isEagleOrAdmin) {
            // Status filtering
            if (activeStatusFilter === 'published') result = result.filter(m => m.is_published);
            else if (activeStatusFilter === 'draft') result = result.filter(m => !m.is_published);

            // Type filtering (Videos / Documents / Links)
            if (activeTypeFilter !== 'all') {
                result = result.filter(m => m.primary_type === activeTypeFilter);
            }
        } else {
            // Eaglet tab filtering
            if (activeEagletTab === 'in_progress') result = result.filter(m => (m.progress || 0) > 0 && (m.progress || 0) < 100 && m.status !== 'completed');
            else if (activeEagletTab === 'completed') result = result.filter(m => (m.progress || 0) >= 100 || m.status === 'completed');
            else if (activeEagletTab === 'overdue') result = result.filter(m => m.is_overdue);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m => m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q));
        }
        return result;
    }, [modules, activeTypeFilter, activeStatusFilter, activeEagletTab, searchQuery, isEagleOrAdmin]);

    const pageTitle = isEagleOrAdmin ? 'My Uploads' : 'My Assignments';
    const pageSubtitle = isEagleOrAdmin
        ? null
        : `You have ${modules.length} total assignments active`;
    const uploadPath = user?.role === 'admin' ? '/admin/content/upload' : '/eagle/content/upload';
    const contentPath = (moduleId) => user?.role === 'eagle' ? `/eagle/content/${moduleId}`
        : user?.role === 'admin' ? `/admin/content` : `/eaglet/assignments/${moduleId}`;

    return (
        <DashboardLayout variant={variant}>
            <AnimatedBg />

            <div className="flex-1 w-full max-w-[1440px] mx-auto py-6 md:py-8">
                {/* ─── Header ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-[28px] font-black text-slate-900 tracking-tight">
                                {pageTitle}
                            </h1>
                            {isEagleOrAdmin && (
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                                    {modules.length} Item{modules.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {pageSubtitle && (
                            <p className="text-sm text-slate-400 mt-1">{pageSubtitle}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder={isEagleOrAdmin ? "Search content..." : "Search tasks..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-52 rounded-xl bg-white text-slate-700 text-sm placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all shadow-sm"
                            />
                        </div>

                        {/* Eagle: Send Assignment + Upload Content buttons */}
                        {isEagleOrAdmin && (
                            <div className="flex items-center gap-2">
                                {user?.role === 'eagle' && nestId && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setShowStandaloneModal(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:border-primary/40 hover:text-primary transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">assignment_add</span>
                                        Send Assignment
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(uploadPath)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    Upload New Content
                                </motion.button>
                            </div>
                        )}

                        {/* Notification bell (Eaglet) */}
                        {!isEagleOrAdmin && (
                            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                                <span className="material-symbols-outlined text-xl">notifications</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── Eaglet Section Switcher ─── */}
                {!isEagleOrAdmin && (
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start mb-6 w-fit">
                        <button
                            onClick={() => setActiveSection('modules')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeSection === 'modules' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">school</span>
                                Learning Modules
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveSection('tasks')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeSection === 'tasks' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">assignment</span>
                                Assignments
                                {standaloneAssignments.length > 0 && (
                                    <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                        {standaloneAssignments.length}
                                    </span>
                                )}
                            </span>
                        </button>
                    </div>
                )}

                {/* ─── Filter Bar ─── */}
                {isEagleOrAdmin ? (
                    /* Eagle/Admin: Type + Status filters */
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        <div className="flex bg-white rounded-xl border border-slate-200 p-1 gap-0.5 shadow-sm">
                            {TYPE_FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setActiveTypeFilter(f.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTypeFilter === f.key
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

                        {/* Status dropdown-style */}
                        <select
                            value={activeStatusFilter}
                            onChange={(e) => setActiveStatusFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 shadow-sm cursor-pointer"
                        >
                            {STATUS_FILTERS.map(f => (
                                <option key={f.key} value={f.key}>{f.key === 'all' ? 'Status: All' : `Status: ${f.label}`}</option>
                            ))}
                        </select>

                        {/* Date range button (decorative, matching UI) */}
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary/30 transition-all shadow-sm">
                            Date Range
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                        </button>
                    </div>
                ) : (
                    /* Eaglet: Tab-style filters (All / In Progress / Completed / Overdue) */
                    <div className="flex gap-1 border-b border-slate-200 mb-8">
                        {EAGLET_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveEagletTab(tab.key)}
                                className={`relative px-5 py-3 text-sm font-semibold transition-all ${activeEagletTab === tab.key
                                    ? 'text-primary'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab.label}
                                {activeEagletTab === tab.key && (
                                    <motion.div
                                        layoutId="eagletActiveTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* ─── Content Grid ─── */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="h-44 bg-slate-100" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 w-20 bg-slate-100 rounded" />
                                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Eagle/Admin: content grid with upload card */}
                        {isEagleOrAdmin ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <AnimatePresence>
                                    {filteredModules.map((module, i) => (
                                        <ContentCard
                                            key={module.id}
                                            module={module}
                                            delay={i}
                                            onClick={() => navigate(contentPath(module.id))}
                                            onAddItem={() => setActiveModuleIdToUpload(module.id)}
                                            onEdit={() => setModuleToEdit(module)}
                                            onDelete={() => handleDeleteModule(module)}
                                            onAddQuiz={() => { setQuizModuleId(module.id); setQuizModuleName(module.title); }}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* "Add More Content" card at end */}
                                <UploadCard onClick={() => navigate(uploadPath)} />
                            </div>
                        ) : activeSection === 'tasks' ? (
                            /* Eaglet: standalone assignments from mentors */
                            tasksLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                                            <div className="h-3 w-24 bg-slate-100 rounded" />
                                            <div className="h-5 w-3/4 bg-slate-100 rounded" />
                                            <div className="h-3 w-1/2 bg-slate-100 rounded" />
                                            <div className="h-8 bg-slate-50 rounded-xl mt-4" />
                                        </div>
                                    ))}
                                </div>
                            ) : standaloneAssignments.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-24">
                                    <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-4xl text-amber-300">assignment</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Assignments Yet</h3>
                                    <p className="text-sm text-slate-400 max-w-md text-center">
                                        Your mentor has not sent any assignments to your Nest yet. Check back soon!
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <AnimatePresence>
                                        {standaloneAssignments.map((assignment, i) => (
                                            <StandaloneTaskCard key={assignment.id} assignment={assignment} index={i} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )
                        ) : (
                            /* Eaglet: learning module cards */
                            filteredModules.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-24">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">school</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Modules Found</h3>
                                    <p className="text-sm text-slate-400 max-w-md text-center leading-relaxed">
                                        {activeEagletTab !== 'all'
                                            ? `No ${activeEagletTab.replace('_', ' ')} modules right now.`
                                            : "Your mentor hasn't published any learning modules yet."
                                        }
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <AnimatePresence>
                                        {filteredModules.map((module, i) => (
                                            <AssignmentCard
                                                key={module.id}
                                                module={module}
                                                delay={i}
                                                onClick={() => navigate(contentPath(module.id))}
                                                onTakeQuiz={() => navigate(`/eaglet/modules/${module.id}/quiz`)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )
                        )}
                    </>
                )}

                {/* ─── Eaglet Bottom Summary Cards ─── */}
                {user?.role === 'eaglet' && modules.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Overall Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl border border-slate-200/70 p-6 flex items-center gap-5 shadow-sm"
                        >
                            <div className="relative shrink-0">
                                <ProgressRing progress={overallProgress} size={64} strokeWidth={5} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-black text-slate-900">{overallProgress}%</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-0.5">Overall Progress</h3>
                                <p className="text-xs text-slate-400">
                                    {pData.completed || 0}/{pData.total_items || 0} items completed
                                </p>
                            </div>
                        </motion.div>

                        {/* Upcoming */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">Upcoming</h3>
                                <span className="material-symbols-outlined text-white/40">event</span>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3">
                                <div className="bg-white text-primary rounded-lg h-10 w-10 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[9px] font-bold uppercase leading-none">Mar</span>
                                    <span className="text-sm font-bold leading-none">15</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Next Assignment Due</p>
                                    <p className="text-xs text-white/60">Check your modules</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Items Completed */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl border border-slate-200/70 p-6 flex flex-col justify-center shadow-sm"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl mb-2">trending_up</span>
                            <p className="text-2xl font-black text-slate-900">{pData.completed || 0}</p>
                            <p className="text-xs text-slate-400 font-medium">Items Completed</p>
                        </motion.div>
                    </div>
                )}
            </div>

            <ContentItemUploadModal
                isOpen={!!activeModuleIdToUpload}
                onClose={() => setActiveModuleIdToUpload(null)}
                moduleId={activeModuleIdToUpload}
            />

            <ContentEditModal
                isOpen={!!moduleToEdit}
                onClose={() => setModuleToEdit(null)}
                module={moduleToEdit}
            />

            <ModuleQuizModal
                isOpen={!!quizModuleId}
                onClose={() => { setQuizModuleId(null); setQuizModuleName(''); }}
                moduleId={quizModuleId}
                moduleName={quizModuleName}
            />

            <StandaloneAssignmentModal
                isOpen={showStandaloneModal}
                onClose={() => setShowStandaloneModal(false)}
                nestId={nestId}
            />
        </DashboardLayout>
    );
};

export default LearningCenterPage;
