import { useState } from 'react';
import { useCreateModule } from '../hooks/useContent';
import { useMyNests } from '../../nest/hooks/useNests';
import { useAuthStore } from '@store';

const ContentUploadModal = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const createModuleMutation = useCreateModule();

    // Need to get the eagle's nest to associate the content
    const { data: nestsResponse } = useMyNests();
    const myNests = nestsResponse?.data || [];
    const isAdmin = user?.role === 'admin';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'beginner',
        points_value: 100,
        nest: '',
        is_published: false
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let finalFormData = { ...formData };
        if (!finalFormData.nest && myNests.length > 0 && !isAdmin) {
            finalFormData.nest = myNests[0].id;
        }

        // If admin and empty, it defaults to global/null
        if (finalFormData.nest === '') {
            finalFormData.nest = null;
        }

        createModuleMutation.mutate(finalFormData, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Create New Module</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!isAdmin && myNests.length === 0 && (
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm mb-4 border border-amber-200">
                            <strong>No Active Nest Found:</strong> You need to create a Nest first before you can upload any content modules. Please navigate to the Nests tab and create one.
                        </div>
                    )}

                    {(isAdmin || myNests.length > 1) && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Nest</label>
                            <select
                                name="nest"
                                value={formData.nest}
                                onChange={handleChange}
                                required={!isAdmin}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            >
                                {isAdmin && <option value="">Global (All Mentees)</option>}
                                {!isAdmin && <option value="">Select a nest...</option>}
                                {myNests.map(n => (
                                    <option key={n.id} value={n.id}>{n.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Module Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Introduction to Leadership"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            placeholder="What will mentees learn in this module?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary capitalize"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Points Value</label>
                            <input
                                type="number"
                                name="points_value"
                                value={formData.points_value}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                        />
                        <label htmlFor="is_published" className="text-sm text-slate-700 font-medium">
                            Publish immediately (visible to mentees)
                        </label>
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
                            disabled={createModuleMutation.isPending || (!isAdmin && myNests.length === 0)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContentUploadModal;
