import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateModule } from '../hooks/useContent';

const ContentEditModal = ({ isOpen, onClose, module }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'beginner',
        estimated_minutes: 0,
    });

    const updateModuleMutation = useUpdateModule();

    useEffect(() => {
        if (module) {
            setFormData({
                title: module.title || '',
                description: module.description || '',
                difficulty: module.difficulty || 'beginner',
                estimated_minutes: module.estimated_minutes || 0,
            });
        }
    }, [module]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('description', formData.description);
        payload.append('difficulty', formData.difficulty);
        payload.append('estimated_minutes', formData.estimated_minutes);

        if (formData.thumbnail) {
            payload.append('thumbnail', formData.thumbnail);
        }

        updateModuleMutation.mutate(
            { id: module.id, data: payload },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900">Edit Module</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Module Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                                placeholder="e.g., Introduction to Neural Networks"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium resize-none"
                                placeholder="What will mentees learn in this module?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium cursor-pointer"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Est. Minutes</label>
                                <input
                                    type="number"
                                    value={formData.estimated_minutes}
                                    onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Cover Image (Optional)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {(formData.thumbnailPreview || module.thumbnail_url) ? (
                                        <img src={formData.thumbnailPreview || module.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-300 text-3xl">image</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFormData({
                                                    ...formData,
                                                    thumbnail: file,
                                                    thumbnailPreview: URL.createObjectURL(file)
                                                });
                                            }
                                        }}
                                        className="hidden"
                                        id="module-thumb-edit"
                                    />
                                    <label
                                        htmlFor="module-thumb-edit"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">cloud_upload</span>
                                        Change Thumbnail
                                    </label>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                        Recommended: 600x400px. JPG, PNG supported.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateModuleMutation.isPending}
                                className="flex-[2] items-center justify-center px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateModuleMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContentEditModal;
