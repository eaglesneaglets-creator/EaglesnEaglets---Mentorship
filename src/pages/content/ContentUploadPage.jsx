import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useCreateModule, useCreateItem, useModules } from '../../modules/content/hooks/useContent';
import { useNests } from '../../modules/nest/hooks/useNests';
import toast from 'react-hot-toast';

/* ─── Constants ─── */
const CONTENT_TYPES = [
    { key: 'video', label: 'Video', icon: 'play_circle' },
    { key: 'document', label: 'Document', icon: 'description' },
    { key: 'reading', label: 'Link', icon: 'link' },
];

const STEP = { MODULE: 'module', ITEM: 'item' };

/* ─── Upload Success Overlay ─── */
const UploadSuccessOverlay = ({ itemTitle, onDone }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        <motion.div
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center max-w-sm w-full"
        >
            {/* Animated check circle */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5"
            >
                <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="material-symbols-outlined text-4xl text-primary"
                >
                    check_circle
                </motion.span>
            </motion.div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Content Published!</h2>
            {itemTitle && (
                <p className="text-sm text-slate-500 font-medium mb-1 max-w-[220px] truncate">
                    "{itemTitle}"
                </p>
            )}
            <p className="text-xs text-slate-400 mb-6">Redirecting to your content library...</p>

            {/* Animated progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.2, ease: 'linear' }}
                />
            </div>

            <button
                onClick={onDone}
                className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors"
            >
                Go now →
            </button>
        </motion.div>
    </motion.div>
);

/* ─── Soft animated background ─── */
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

/* ─── Form Field ─── */
const FormField = ({ label, required, children }) => (
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
);

const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

/* ─── Thumbnail Upload Box ─── */
const ThumbnailUpload = ({ value, onChange, label = 'Thumbnail (optional)' }) => {
    const ref = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        onChange(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
    };

    const clear = (e) => {
        e.stopPropagation();
        onChange(null);
        setPreview(null);
        if (ref.current) ref.current.value = '';
    };

    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <div
                onClick={() => ref.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            >
                <input ref={ref} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])} />

                {preview ? (
                    <div className="flex items-center gap-3 p-3">
                        <img src={preview} alt="thumbnail preview"
                            className="w-16 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{value?.name}</p>
                            <p className="text-xs text-slate-400">Click to change</p>
                        </div>
                        <button type="button" onClick={clear}
                            className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 text-slate-400">
                        <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                        <span className="text-sm">Upload cover image — drag or click</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Main Page ─── */
const ContentUploadPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);
    const isAdmin = user?.role === 'admin';

    const [activeStep, setActiveStep] = useState(STEP.MODULE);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadedTitle, setUploadedTitle] = useState('');

    // Thumbnail state
    const [moduleThumbnail, setModuleThumbnail] = useState(null);
    const [itemThumbnail, setItemThumbnail] = useState(null);

    const createModuleMutation = useCreateModule();

    // Eagles own nests — use /nests/ which returns eagle's own nests for eagle role
    const { data: nestsResponse } = useNests();
    const myNests = nestsResponse?.data?.results || nestsResponse?.data || [];
    const firstNestId = myNests?.[0]?.id || user?.nest_id;
    const { data: modulesResponse } = useModules({ nest: firstNestId });
    const modules = modulesResponse?.results || modulesResponse?.data || [];

    // Module form state
    const [moduleForm, setModuleForm] = useState({
        title: '', description: '', difficulty: 'beginner',
        points_value: 100, nest: '', is_published: false, visibility: 'nest_only',
    });

    // Item form state
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [contentType, setContentType] = useState('video');
    const [itemTitle, setItemTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [file, setFile] = useState(null);
    const [itemDuration, _setItemDuration] = useState(0);
    const [itemPoints, _setItemPoints] = useState(0);
    const [isRequired, _setIsRequired] = useState(true);

    const createItemMutation = useCreateItem(selectedModuleId);

    const handleModuleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setModuleForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    };
    const handleFileSelect = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleModuleSubmit = (e) => {
        e.preventDefault();
        let finalData = { ...moduleForm };
        // Auto-assign nest for eagles if they have nests
        if ((!finalData.nest || finalData.nest === '') && myNests.length > 0 && !isAdmin) {
            finalData.nest = myNests[0].id;
        }
        // Build FormData so thumbnail (image file) can be included
        const payload = new FormData();
        Object.entries(finalData).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') payload.append(k, v);
        });
        if (moduleThumbnail) payload.append('thumbnail', moduleThumbnail);

        createModuleMutation.mutate(payload, {
            onSuccess: (response) => {
                const newModule = response?.data;
                if (newModule?.id) setSelectedModuleId(newModule.id);
                setModuleForm({ title: '', description: '', difficulty: 'beginner', points_value: 100, nest: '', is_published: false, visibility: 'nest_only' });
                setModuleThumbnail(null);
                toast.success('Module created! Now add content items.');
                setActiveStep(STEP.ITEM);
            }
        });
    };

    const handleItemSubmit = (e) => {
        e.preventDefault();
        if (!selectedModuleId) { toast.error('Please select a module.'); return; }

        const payload = new FormData();
        payload.append('title', itemTitle);
        payload.append('content_type', contentType);
        payload.append('duration_minutes', itemDuration);
        payload.append('points_value', itemPoints);
        payload.append('is_required', isRequired);
        if (contentType === 'reading' && linkUrl) payload.append('file_url', linkUrl);
        if (file && contentType !== 'reading') payload.append('file', file);
        if (itemThumbnail) payload.append('thumbnail', itemThumbnail);

        setIsUploading(true);
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) { clearInterval(progressInterval); return 90; }
                return prev + Math.random() * 15;
            });
        }, 300);

        createItemMutation.mutate(payload, {
            onSuccess: () => {
                clearInterval(progressInterval);
                setUploadProgress(100);
                setUploadedTitle(itemTitle);
                setItemThumbnail(null);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setShowSuccess(true);
                    // Auto-navigate after the progress bar animation completes (2.4s)
                    setTimeout(() => navigate(backPath), 2400);
                }, 400);
            },
            onError: () => {
                clearInterval(progressInterval);
                setIsUploading(false);
                setUploadProgress(0);
                // User stays on page to fix and retry — no navigation
            }
        });
    };

    const acceptTypes = contentType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx';
    const backPath = user?.role === 'admin' ? '/admin/content' : '/eagle/content';
    const layoutVariant = user?.role === 'eagle' ? 'eagle' : user?.role === 'admin' ? 'admin' : 'eaglet';

    return (
        <DashboardLayout variant={layoutVariant}>
            <AnimatedBg />

            <div className="flex-1 w-full max-w-[780px] mx-auto py-6 md:py-8 px-4">
                {/* Page Title */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-[28px] font-black text-slate-900 tracking-tight">
                        Upload Content
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Add educational materials for mentees.
                    </p>
                </div>

                {/* Step Tabs */}
                <div className="flex items-center gap-2 mb-8">
                    <button onClick={() => setActiveStep(STEP.MODULE)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeStep === STEP.MODULE
                            ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                            : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-600'
                            }`}>
                        <span className="material-symbols-outlined text-[18px]">library_books</span>
                        Create Module
                    </button>
                    <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                    <button onClick={() => setActiveStep(STEP.ITEM)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeStep === STEP.ITEM
                            ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                            : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-600'
                            }`}>
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Add Content
                    </button>
                </div>

                {/* ─── Forms ─── */}
                <AnimatePresence mode="wait">
                    {activeStep === STEP.MODULE ? (
                        /* ═══ MODULE FORM ═══ */
                        <motion.div key="module" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">

                            <form onSubmit={handleModuleSubmit} className="p-6 md:p-8 space-y-6">
                                {!isAdmin && myNests.length === 0 && (
                                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm border border-amber-200 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
                                        <span><strong>No Active Nest Found:</strong> Create a Nest first before uploading content.</span>
                                    </div>
                                )}

                                {(isAdmin || myNests.length > 1) && (
                                    <FormField label="Target Nest">
                                        <select name="nest" value={moduleForm.nest} onChange={handleModuleChange} required={!isAdmin} className={inputClass}>
                                            {isAdmin && <option value="">Global (All Mentees)</option>}
                                            {!isAdmin && <option value="">Select a nest...</option>}
                                            {myNests.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                        </select>
                                    </FormField>
                                )}

                                <FormField label="Module Title" required>
                                    <input type="text" name="title" value={moduleForm.title} onChange={handleModuleChange}
                                        required className={inputClass} placeholder="e.g. Introduction to Leadership" />
                                </FormField>

                                <FormField label="Description" required>
                                    <textarea name="description" value={moduleForm.description} onChange={handleModuleChange}
                                        rows={3} required className={`${inputClass} resize-none`}
                                        placeholder="What will mentees learn in this module?" />
                                </FormField>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Difficulty">
                                        <select name="difficulty" value={moduleForm.difficulty} onChange={handleModuleChange} className={inputClass}>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Points Value">
                                        <input type="number" name="points_value" value={moduleForm.points_value}
                                            onChange={handleModuleChange} min="0" className={inputClass} />
                                    </FormField>
                                </div>

                                {/* Module Thumbnail */}
                                <ThumbnailUpload
                                    value={moduleThumbnail}
                                    onChange={setModuleThumbnail}
                                    label="Module Cover Image (optional)"
                                />

                                {/* Visibility */}
                                <FormField label="Visibility">
                                    <select name="visibility" value={moduleForm.visibility} onChange={handleModuleChange} className={inputClass}>
                                        <option value="all_mentees">All Mentees — appears in Resource Center</option>
                                        <option value="nest_only">Nest Only — appears in Learning Modules (Assignments)</option>
                                    </select>
                                </FormField>

                                {/* Publish toggle */}
                                <div className="flex items-center gap-3 py-1">
                                    <button type="button"
                                        onClick={() => setModuleForm(prev => ({ ...prev, is_published: !prev.is_published }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${moduleForm.is_published ? 'bg-primary' : 'bg-slate-300'
                                            }`}>
                                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${moduleForm.is_published ? 'translate-x-[22px]' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                    <span className="text-sm font-medium text-slate-600">Publish immediately</span>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={createModuleMutation.isPending || (!isAdmin && myNests.length === 0)}
                                        className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                                        {createModuleMutation.isPending ? (
                                            <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Creating...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[18px]">add_circle</span> Create Module</>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        /* ═══ CONTENT ITEM FORM — matches "Upload Content" screenshot ═══ */
                        <motion.div key="item" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">

                            <form onSubmit={handleItemSubmit} className="p-6 md:p-8 space-y-6">
                                {/* Content Title */}
                                <FormField label="Content Title" required>
                                    <input type="text" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)}
                                        required className={inputClass} placeholder="Enter a descriptive title for this content." />
                                </FormField>

                                {/* Content Type Selector — segmented control matching screenshot */}
                                <FormField label="Content Type">
                                    <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
                                        {CONTENT_TYPES.map((type) => (
                                            <button key={type.key} type="button"
                                                onClick={() => setContentType(type.key)}
                                                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${contentType === type.key
                                                    ? 'bg-white text-primary shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}>
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>

                                {/* Module Selector */}
                                <FormField label="Add to Module" required>
                                    <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}
                                        required className={inputClass}>
                                        <option value="">Select a module...</option>
                                        {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                    </select>
                                    {modules.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">info</span>
                                            No modules found. Create one first.
                                        </p>
                                    )}
                                </FormField>

                                {/* Upload Area / Link Input */}
                                {contentType === 'reading' ? (
                                    <FormField label="URL" required>
                                        <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                                            required className={inputClass} placeholder="https://example.com/article" />
                                    </FormField>
                                ) : (
                                    <FormField label="Upload File" required>
                                        <div onClick={() => fileInputRef.current?.click()}
                                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${isDragging
                                                ? 'border-primary bg-primary/5 scale-[1.01]'
                                                : file
                                                    ? 'border-primary/40 bg-primary/[0.02]'
                                                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                                                }`}>
                                            <input ref={fileInputRef} type="file" className="hidden" accept={acceptTypes} onChange={handleFileSelect} />

                                            {file ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary">
                                                            {contentType === 'video' ? 'videocam' : 'description'}
                                                        </span>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                                    </div>
                                                    <button type="button"
                                                        onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                        className="ml-2 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                                        <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">Drag and drop file here</p>
                                                    <p className="text-xs text-slate-400 mt-1">or click to browse your files</p>
                                                    <button type="button"
                                                        className="mt-4 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                                                        Browse Files
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Upload Progress */}
                                        {isUploading && (
                                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-500 font-medium">Uploading...</span>
                                                    <span className="text-primary font-bold">{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                                        animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </FormField>
                                )}

                                {/* Item Thumbnail */}
                                <ThumbnailUpload
                                    value={itemThumbnail}
                                    onChange={setItemThumbnail}
                                    label={contentType === 'video' ? 'Custom Thumbnail (optional — auto-generated if not set)' : 'Thumbnail (optional)'}
                                />

                                {/* Submit — right aligned, matching "Publish Content" in screenshot */}
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={createItemMutation.isPending || !selectedModuleId || (contentType !== 'reading' && !file) || isUploading}
                                        className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                                        {createItemMutation.isPending || isUploading ? (
                                            <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Uploading...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[18px]">publish</span> Publish Content</>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* ─── Success Overlay ─── */}
            <AnimatePresence>
                {showSuccess && (
                    <UploadSuccessOverlay
                        itemTitle={uploadedTitle}
                        onDone={() => navigate(backPath)}
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default ContentUploadPage;
