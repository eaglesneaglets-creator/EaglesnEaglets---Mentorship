import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useNestDetail, useNestRequests, useRespondToRequest } from '../../modules/nest/hooks/useNests';
import toast from 'react-hot-toast';

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

const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

const NestSettingsPage = () => {
    const { user } = useAuthStore();
    const { nestId } = useParams();
    const navigate = useNavigate();

    const { data: nestData, isLoading, isError } = useNestDetail(nestId);
    const { data: requestsResponse } = useNestRequests(nestId);
    const respondMutation = useRespondToRequest(nestId);

    const pendingRequests = requestsResponse?.data || [];

    const [formData, setFormData] = useState({
        name: nestData?.data?.name || '',
        description: nestData?.data?.description || '',
        industry_focus: nestData?.data?.industry_focus || '',
        privacy: nestData?.data?.privacy || 'public',
    });

    const [prevNestData, setPrevNestData] = useState(nestData);
    if (prevNestData !== nestData) {
        setPrevNestData(nestData);
        if (nestData?.data) {
            setFormData({
                name: nestData.data.name || '',
                description: nestData.data.description || '',
                industry_focus: nestData.data.industry_focus || '',
                privacy: nestData.data.privacy || 'public',
            });
        }
    }

    if (user?.role !== 'eagle') {
        return <Navigate to="/eaglet/dashboard" replace />;
    }

    if (isLoading) {
        return (
            <DashboardLayout variant="eagle">
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-12 h-12 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (isError || !nestData?.data) {
        return <Navigate to="/eagle/dashboard" replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Update nest:', formData);
        toast.success('Settings saved!');
        navigate(`/eagle/nests/${nestId}`);
    };

    const handleRespond = (requestId, status) => {
        respondMutation.mutate(
            { requestId, status },
            {
                onSuccess: () => toast.success(`Request ${status}ed successfully`),
                onError: (error) => toast.error(error.message || `Failed to ${status} request`)
            }
        );
    };

    return (
        <DashboardLayout variant="eagle">
            <AnimatedBg />

            <div className="flex-1 w-full max-w-3xl mx-auto py-6 md:py-8 px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <button
                        onClick={() => navigate(`/eagle/nests/${nestId}`)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Nest Settings</h1>
                        <p className="text-sm text-slate-400">Manage your nest details and configuration.</p>
                    </div>
                </motion.div>

                {/* Settings Form */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden"
                >
                    <form onSubmit={handleSubmit}>
                        {/* Basic Info Section */}
                        <div className="p-6 md:p-8 space-y-5">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                                </span>
                                Basic Information
                            </h2>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nest Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange}
                                    rows={4} className={`${inputClass} resize-none`} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Industry Focus</label>
                                    <input type="text" name="industry_focus" value={formData.industry_focus} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Privacy</label>
                                    <select name="privacy" value={formData.privacy} onChange={handleChange} className={inputClass}>
                                        <option value="public">Public (Anyone can request)</option>
                                        <option value="private">Private (Invite only)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pending Requests Section */}
                        <div className="p-6 md:p-8 border-t border-slate-100 space-y-4">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-600 text-[18px]">inbox</span>
                                </span>
                                Pending Requests
                                {pendingRequests.length > 0 && (
                                    <span className="ml-2 text-xs font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </h2>

                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                    <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">inbox</span>
                                    <p className="text-sm text-slate-400">No pending mentorship requests.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                    {req.eaglet?.first_name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {req.eaglet?.first_name} {req.eaglet?.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">
                                                        {req.message || 'No message provided'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button type="button" disabled={respondMutation.isPending}
                                                    onClick={() => handleRespond(req.id, 'reject')}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
                                                    Decline
                                                </button>
                                                <motion.button type="button" disabled={respondMutation.isPending}
                                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => handleRespond(req.id, 'approve')}
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                                    Approve
                                                </motion.button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="p-6 md:p-8 border-t border-slate-100 flex justify-end gap-3">
                            <button type="button"
                                onClick={() => navigate(`/eagle/nests/${nestId}`)}
                                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm">
                                Cancel
                            </button>
                            <motion.button type="submit"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm shadow-lg shadow-primary/20">
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default NestSettingsPage;
