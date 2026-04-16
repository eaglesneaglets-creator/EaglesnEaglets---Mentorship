import { useState } from 'react';
import { useCreateItem } from '../hooks/useContent';
import { sanitizeImageUrl } from '../../../shared/utils/sanitize';

const ContentItemUploadModal = ({ isOpen, onClose, moduleId }) => {
    const createItemMutation = useCreateItem(moduleId);

    const [formData, setFormData] = useState({
        title: '',
        content_type: 'document',
        duration_minutes: 0,
        points_value: 0,
        is_required: true,
    });

    const [fileOptions, setFileOptions] = useState({
        file: null,
        file_url: ''
    });

    if (!isOpen || !moduleId) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileOptions({ ...fileOptions, file: e.target.files[0] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Build FormData
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content_type', formData.content_type);
        payload.append('duration_minutes', formData.duration_minutes);
        payload.append('points_value', formData.points_value);
        payload.append('is_required', formData.is_required);

        // Optional Link Fallback
        if (formData.content_type === 'reading' && fileOptions.file_url) {
            payload.append('file_url', fileOptions.file_url);
        }

        // File upload
        if (fileOptions.file && formData.content_type !== 'reading') {
            payload.append('file', fileOptions.file);
        }

        // Manual thumbnail
        if (fileOptions.thumbnail) {
            payload.append('thumbnail', fileOptions.thumbnail);
        }

        createItemMutation.mutate(payload, {
            onSuccess: () => {
                setFormData({
                    title: '',
                    content_type: 'document',
                    duration_minutes: 0,
                    points_value: 0,
                    is_required: true,
                });
                setFileOptions({ file: null, file_url: '', thumbnail: null, thumbnailPreview: '' });
                onClose();
            }
        });
    };

    const isVideoOrDoc = formData.content_type === 'video' || formData.content_type === 'document';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Add Content Item</h2>
                    <button
                        onClick={onClose}
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                        >
                            <option value="document">Document (PDF, Word)</option>
                            <option value="video">Video</option>
                            <option value="reading">Reading (Link)</option>
                            <option value="quiz">Quiz</option>
                        </select>
                    </div>

                    {isVideoOrDoc ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                required
                                accept={formData.content_type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                    ) : (formData.content_type === 'reading' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reading Link URL</label>
                            <input
                                type="url"
                                value={fileOptions.file_url}
                                onChange={(e) => setFileOptions({ ...fileOptions, file_url: e.target.value })}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                                placeholder="https://example.com/article"
                            />
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                min="0"
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
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setFileOptions({
                                                ...fileOptions,
                                                thumbnail: file,
                                                thumbnailPreview: URL.createObjectURL(file)
                                            });
                                        }
                                    }}
                                    className="hidden"
                                    id="item-thumb-upload"
                                />
                                <label
                                    htmlFor="item-thumb-upload"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
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
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createItemMutation.isPending || (isVideoOrDoc && !fileOptions.file)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createItemMutation.isPending ? 'Uploading...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContentItemUploadModal;
