import { useState, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useAuthStore } from '@store';
import { useNestDetail, useNestRequests, useRespondToRequest, useUpdateNest } from '../../modules/nest/hooks/useNests';
import { toast } from 'sonner';
import { apiClient } from '@api';
import { sanitizeImageUrl } from '../../shared/utils/sanitize';

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
    const updateMutation = useUpdateNest(nestId);

    const pendingRequests = requestsResponse?.data || [];

    const [formData, setFormData] = useState({
        name: nestData?.data?.name || '',
        description: nestData?.data?.description || '',
        industry_focus: nestData?.data?.industry_focus || '',
        privacy: nestData?.data?.privacy || 'public',
        max_members: nestData?.data?.max_members ?? 50,
        meeting_link: nestData?.data?.meeting_link || '',
        allow_referrals: nestData?.data?.allow_referrals ?? true,
        banner_image: nestData?.data?.banner_image || '',
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
                max_members: nestData.data.max_members ?? 50,
                meeting_link: nestData.data.meeting_link || '',
                allow_referrals: nestData.data.allow_referrals ?? true,
                banner_image: nestData.data.banner_image || '',
            });
        }
    }

    // Banner image file upload state
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const bannerInputRef = useRef(null);

    const handleBannerSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleRemoveBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
        if (bannerInputRef.current) bannerInputRef.current.value = '';
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        let patchData = { ...formData };

        // If a new banner image file was selected, upload it first
        if (bannerFile) {
            setIsUploadingBanner(true);
            try {
                const uploadForm = new FormData();
                uploadForm.append('file', bannerFile);
                const uploadRes = await apiClient.upload('/nests/upload/', uploadForm);
                patchData.banner_image = uploadRes?.url || uploadRes?.data?.url || '';
            } catch {
                toast.error('Banner image upload failed. Please try again.');
                setIsUploadingBanner(false);
                return;
            }
            setIsUploadingBanner(false);
        }

        updateMutation.mutate(patchData, {
            onSuccess: () => {
                toast.success('Nest settings saved!');
                navigate(`/eagle/nests/${nestId}`);
            },
            onError: (err) => {
                const msg = err?.response?.data?.error?.message
                    || err?.response?.data?.message
                    || err?.message
                    || 'Failed to save settings.';
                toast.error(msg);
            },
        });
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
                                        <option value="invitation_only">Private (Invite only)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Max Members</label>
                                    <input type="number" name="max_members" value={formData.max_members}
                                        onChange={handleChange} min={2} max={200} className={inputClass} />
                                    <p className="text-xs text-slate-400 mt-1">Between 2 and 200.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Link</label>
                                    <input type="url" name="meeting_link" value={formData.meeting_link}
                                        onChange={handleChange} placeholder="https://zoom.us/j/..." className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Banner Image</label>
                                {/* Preview */}
                                {(bannerPreview || formData.banner_image) && (
                                    <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 h-32">
                                        <img
                                            src={sanitizeImageUrl(bannerPreview || formData.banner_image)}
                                            alt="Banner preview"
                                            className="w-full h-full object-cover"
                                        />
                                        {bannerPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveBanner}
                                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* File picker */}
                                <input
                                    ref={bannerInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-primary/40 hover:text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">upload</span>
                                    {bannerFile ? bannerFile.name : 'Choose Image'}
                                </button>
                                <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or WebP. Recommended: 1200×400px.</p>
                            </div>

                            <div className="flex items-center justify-between py-3 border border-slate-200 rounded-xl px-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Allow Referrals</p>
                                    <p className="text-xs text-slate-400">Let members invite others to join this nest.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, allow_referrals: !prev.allow_referrals }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.allow_referrals ? 'bg-primary' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.allow_referrals ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
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
                                whileHover={{ scale: updateMutation.isPending ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={updateMutation.isPending || isUploadingBanner}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                                {isUploadingBanner ? (
                                    <><span className="material-symbols-outlined animate-spin text-base">sync</span> Uploading image...</>
                                ) : updateMutation.isPending ? (
                                    <><span className="material-symbols-outlined animate-spin text-base">sync</span> Saving...</>
                                ) : (
                                    'Save Settings'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default NestSettingsPage;
