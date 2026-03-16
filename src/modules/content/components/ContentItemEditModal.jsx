import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateItem } from '../hooks/useContent';

const ContentItemEditModal = ({ isOpen, onClose, moduleId, item }) => {
    const [formData, setFormData] = useState({
        title: '',
        content_type: 'reading',
        duration_minutes: 0,
        points_value: 0,
        is_required: true,
        order: 0,
    });

    const updateItemMutation = useUpdateItem(moduleId);

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || '',
                content_type: item.content_type || 'reading',
                duration_minutes: item.duration_minutes || 0,
                points_value: item.points_value || 0,
                is_required: item.is_required ?? true,
                order: item.order || 0,
            });
        }
    }, [item]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateItemMutation.mutate(
            { itemId: item.id, formData },
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
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                        <h2 className="text-xl font-black text-slate-900">Edit Content Item</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Item Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                                placeholder="e.g., Lesson 1: Getting Started"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Content Type</label>
                                <select
                                    value={formData.content_type}
                                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium cursor-pointer"
                                >
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                    <option value="reading">Link/Reading</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Points Value</label>
                                <input
                                    type="number"
                                    value={formData.points_value}
                                    onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Duration (min)</label>
                                <input
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-1">
                            <input
                                type="checkbox"
                                id="is_required"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="is_required" className="text-sm font-bold text-slate-600 cursor-pointer">Required for completion</label>
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
                                disabled={updateItemMutation.isPending}
                                className="flex-[2] items-center justify-center px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateItemMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContentItemEditModal;
