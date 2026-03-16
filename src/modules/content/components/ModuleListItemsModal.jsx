import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModuleItems, useDeleteItem } from '../hooks/useContent';
import ContentItemViewerModal from './ContentItemViewerModal';
import ContentItemEditModal from './ContentItemEditModal';
import { useAuthStore } from '@store';

const ModuleListItemsModal = ({ isOpen, onClose, module }) => {
    const { user } = useAuthStore();

    // We only fetch when open and module is present
    const { data: itemsResponse, isLoading } = useModuleItems(module?.id, { enabled: !!module?.id && isOpen });

    // Safely extract items from Response
    // Our ContentItemViewSet list method returns Response({"success": True, "data": serializer.data})
    const items = itemsResponse?.data?.data || itemsResponse?.data || [];

    const [activeItem, setActiveItem] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);

    const deleteItemMutation = useDeleteItem(module.id);

    const handleDeleteItem = (e, item) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
            deleteItemMutation.mutate(item.id);
        }
    };

    const handleEditItem = (e, item) => {
        e.stopPropagation();
        setItemToEdit(item);
    };

    // Some icons by type
    const icons = {
        video: 'play_circle',
        document: 'auto_stories',
        link: 'link'
    };

    // Close when clicking outside of the modal
    if (!module) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 p-safe">
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
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">library_books</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{module.title}</h2>
                                    <p className="text-sm text-slate-500 line-clamp-1">{module.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
                            {isLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    <p className="text-slate-500 text-sm font-medium">Loading content items...</p>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                                    <p className="text-slate-500 font-medium">No items in this module yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setActiveItem(item)}
                                            className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer relative"
                                        >
                                            {/* Left Icon */}
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${item.content_type === 'video' ? 'bg-blue-100 text-blue-600' :
                                                item.content_type === 'document' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-purple-100 text-purple-600'
                                                }`}>
                                                <span className="material-symbols-outlined text-[24px]">
                                                    {icons[item.content_type] || 'description'}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                                                        {index + 1}. {item.title}
                                                    </h3>
                                                    {item.points_value > 0 && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded shrink-0">
                                                            {item.points_value} pts
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1 capitalize font-medium">
                                                        {item.content_type}
                                                    </span>
                                                    {item.duration_minutes > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                            {item.duration_minutes} min
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Eagle/Admin Actions */}
                                            {(user?.role === 'eagle' || user?.role === 'admin') && (
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <button
                                                        onClick={(e) => handleEditItem(e, item)}
                                                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteItem(e, item)}
                                                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Play indicator */}
                                            <div className="hidden sm:flex shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Viewer Nested Modal */}
                    {activeItem && (
                        <ContentItemViewerModal
                            isOpen={!!activeItem}
                            onClose={() => setActiveItem(null)}
                            item={activeItem}
                        />
                    )}

                    {/* Item Edit Modal */}
                    <ContentItemEditModal
                        isOpen={!!itemToEdit}
                        onClose={() => setItemToEdit(null)}
                        moduleId={module.id}
                        item={itemToEdit}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default ModuleListItemsModal;
