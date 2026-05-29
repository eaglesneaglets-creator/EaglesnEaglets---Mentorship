import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useCreateItem } from '../hooks/useContent';
import { sanitizeImageUrl } from '../../../shared/utils/sanitize';
import { directUpload } from '../../../shared/utils/direct-upload';

const INITIAL_FORM = {
    title: '',
    content_type: 'document',
    duration_minutes: 0,
    points_value: 0,
    is_required: true,
};

const INITIAL_FILE_STATE = {
    file: null,
    file_url: '',
    thumbnail: null,
    thumbnailPreview: '',
};

const acceptFor = (contentType) =>
    contentType === 'video'
        ? 'video/*'
        : '.pdf,.doc,.docx,.ppt,.pptx';

const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ContentItemUploadModal = ({ isOpen, onClose, moduleId }) => {
    const createItemMutation = useCreateItem(moduleId);

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [fileOptions, setFileOptions] = useState(INITIAL_FILE_STATE);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('idle'); // idle | file | thumb | saving
    const [isDragging, setIsDragging] = useState(false);
    const abortRef = useRef(null);

    // Cancel any in-flight upload if the modal closes mid-upload.
    useEffect(() => {
        if (!isOpen && abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, [isOpen]);

    if (!isOpen || !moduleId) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const pickFile = (file) => {
        if (!file) return;
        setFileOptions((prev) => ({ ...prev, file }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!isDragging) setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) pickFile(file);
    };

    const resetAll = () => {
        setFormData(INITIAL_FORM);
        setFileOptions(INITIAL_FILE_STATE);
        setProgress(0);
        setPhase('idle');
        abortRef.current = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (phase !== 'idle') return;

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content_type', formData.content_type);
        payload.append('duration_minutes', formData.duration_minutes);
        payload.append('points_value', formData.points_value);
        payload.append('is_required', formData.is_required);

        // Reading-type items just store a URL — no upload needed.
        if (formData.content_type === 'reading' && fileOptions.file_url) {
            payload.append('file_url', fileOptions.file_url);
        }

        const needsFileUpload =
            (formData.content_type === 'video' || formData.content_type === 'document')
            && fileOptions.file;

        const ac = new AbortController();
        abortRef.current = ac;

        try {
            // 1. Upload the main asset straight to Cloudinary.
            if (needsFileUpload) {
                setPhase('file');
                setProgress(0);
                const fileResult = await directUpload(fileOptions.file, {
                    context: 'content_item',
                    onProgress: setProgress,
                    signal: ac.signal,
                });
                payload.append('file_url', fileResult.secureUrl);
                if (fileResult.bytes) payload.append('file_size', fileResult.bytes);
            }

            // 2. Optional manual thumbnail.
            if (fileOptions.thumbnail) {
                setPhase('thumb');
                setProgress(0);
                const thumbResult = await directUpload(fileOptions.thumbnail, {
                    context: 'content_thumbnail',
                    onProgress: setProgress,
                    signal: ac.signal,
                });
                payload.append('thumbnail_url', thumbResult.secureUrl);
            }

            // 3. Create the DB record — BE never sees the file bytes.
            setPhase('saving');
            await createItemMutation.mutateAsync(payload);

            toast.success('Content item added.');
            resetAll();
            onClose();
        } catch (err) {
            if (err?.code === 'Aborted') return;
            toast.error(err?.message || 'Upload failed. Please try again.');
            setPhase('idle');
            setProgress(0);
        }
    };

    const isVideoOrDoc =
        formData.content_type === 'video' || formData.content_type === 'document';
    const uploading = phase === 'file' || phase === 'thumb';
    const submitting = uploading || phase === 'saving' || createItemMutation.isPending;

    const phaseLabel =
        phase === 'file'
            ? `Uploading ${formData.content_type}…`
            : phase === 'thumb'
                ? 'Uploading thumbnail…'
                : phase === 'saving'
                    ? 'Saving…'
                    : 'Add Item';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Add Content Item</h2>
                    <button
                        onClick={() => {
                            if (abortRef.current) abortRef.current.abort();
                            resetAll();
                            onClose();
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Item Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Chapter 1 Video"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                        <select
                            name="content_type"
                            value={formData.content_type}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                        >
                            <option value="document">Document (PDF, Word, PPT)</option>
                            <option value="video">Video</option>
                            <option value="reading">Reading (Link)</option>
                            <option value="quiz">Quiz</option>
                        </select>
                    </div>

                    {isVideoOrDoc ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                                    isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 bg-slate-50 hover:border-primary/40'
                                }`}
                            >
                                <input
                                    type="file"
                                    onChange={(e) => pickFile(e.target.files?.[0])}
                                    required={!fileOptions.file}
                                    disabled={submitting}
                                    accept={acceptFor(formData.content_type)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className="flex flex-col items-center justify-center py-6 px-4 text-center pointer-events-none">
                                    {fileOptions.file ? (
                                        <>
                                            <span className="material-symbols-outlined text-primary text-3xl mb-1">description</span>
                                            <p className="text-sm font-semibold text-slate-800 truncate max-w-full">
                                                {fileOptions.file.name}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {formatBytes(fileOptions.file.size)} • Click to replace
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">cloud_upload</span>
                                            <p className="text-sm font-semibold text-slate-700">
                                                Drop file here or click to browse
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {formData.content_type === 'video'
                                                    ? 'MP4, MOV, WebM up to 500 MB'
                                                    : 'PDF, Word, PPT up to 500 MB'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (formData.content_type === 'reading' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reading Link URL</label>
                            <input
                                type="url"
                                value={fileOptions.file_url}
                                onChange={(e) => setFileOptions((p) => ({ ...p, file_url: e.target.value }))}
                                required
                                disabled={submitting}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                                placeholder="https://example.com/article"
                            />
                        </div>
                    ))}

                    {/* Live upload progress */}
                    {uploading && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                                <span>{phase === 'file' ? 'File upload' : 'Thumbnail upload'}</span>
                                <span className="tabular-nums">{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-200"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                min="0"
                                disabled={submitting}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Points Value</label>
                            <input
                                type="number"
                                name="points_value"
                                value={formData.points_value}
                                onChange={handleChange}
                                min="0"
                                disabled={submitting}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_required"
                            name="is_required"
                            checked={formData.is_required}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                        />
                        <label htmlFor="is_required" className="text-sm text-slate-700 font-medium">
                            Required for module completion
                        </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Manual Thumbnail (Optional)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                {fileOptions.thumbnailPreview ? (
                                    <img src={sanitizeImageUrl(fileOptions.thumbnailPreview)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-slate-300 text-2xl">image</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={submitting}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFileOptions((prev) => ({
                                                ...prev,
                                                thumbnail: file,
                                                thumbnailPreview: URL.createObjectURL(file),
                                            }));
                                        }
                                    }}
                                    className="hidden"
                                    id="item-thumb-upload"
                                />
                                <label
                                    htmlFor="item-thumb-upload"
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold transition-all ${
                                        submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-base">cloud_upload</span>
                                    {fileOptions.thumbnail ? 'Change' : 'Upload'} Image
                                </label>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    Leave blank for auto-generation (videos/PDFs).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (abortRef.current) abortRef.current.abort();
                                resetAll();
                                onClose();
                            }}
                            className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                        >
                            {submitting ? 'Cancel' : 'Close'}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (isVideoOrDoc && !fileOptions.file)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                            {submitting && (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            )}
                            {phaseLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ContentItemUploadModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    moduleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ContentItemUploadModal;
