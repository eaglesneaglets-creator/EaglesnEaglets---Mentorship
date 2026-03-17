import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateProgress } from '../hooks/useContent';
import toast from 'react-hot-toast';

const ContentItemViewerModal = ({ isOpen, onClose, item }) => {
    const videoRef = useRef(null);
    const { mutate: updateProgress } = useUpdateProgress();
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(0);
    const hasReported50 = useRef(false);

    const [isSaving, setIsSaving] = useState(false);

    // Throttle progress updates to avoid spamming the backend
    const syncProgressToServer = useCallback(
        (percent, duration, force = false) => {
            const now = Date.now();
            // Sync if forced (e.g. video ended or document read) OR if 5 seconds have passed
            if (force || now - lastSyncTime > 5000) {
                if (item?.id) {
                    updateProgress(
                        {
                            itemId: item.id,
                            data: {
                                progress_percentage: percent,
                                watch_duration_seconds: duration,
                            },
                        },
                        {
                            onSuccess: () => {
                                // If the status just transitioned to completed, notify!
                                // We check if force was true, which usually means 100% completion in our UI handling.
                                if (force && percent >= 100) {
                                    toast.success(
                                        <div className="flex flex-col">
                                            <span className="font-bold">Content Completed!</span>
                                            <span className="text-sm">You earned points for this activity.</span>
                                        </div>,
                                        { icon: '🌟' }
                                    );
                                }
                            }
                        }
                    );
                    setLastSyncTime(now);
                }
            }
        },
        [item, updateProgress, lastSyncTime]
    );


    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const currentTime = video.currentTime;
        const duration = video.duration;

        if (duration) {
            const currentProgress = (currentTime / duration) * 100;
            setProgressPercentage(currentProgress);
            // Explicitly report 50% milestone once — ensures resource gate is cleared
            if (currentProgress >= 50 && !hasReported50.current && item?.id) {
                hasReported50.current = true;
                updateProgress({
                    itemId: item.id,
                    data: { progress_percentage: 50, watch_duration_seconds: Math.floor(currentTime) },
                });
            }
            syncProgressToServer(currentProgress, Math.floor(currentTime));
        }
    };

    const handleEnded = () => {
        setProgressPercentage(100);
        syncProgressToServer(100, Math.floor(videoRef.current?.duration || 0), true);
    };

    const handleDocumentComplete = () => {
        setIsSaving(true);
        setProgressPercentage(100);
        syncProgressToServer(100, 0, true);
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 1000);
    };


    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const [prevResetKey, setPrevResetKey] = useState(`${isOpen}-${item?.id}`);
    const resetKey = `${isOpen}-${item?.id}`;
    if (prevResetKey !== resetKey) {
        setPrevResetKey(resetKey);
        if (isOpen) {
            setProgressPercentage(0);
            setLastSyncTime(0);
            hasReported50.current = false;
        }
    }

    // Report 50% progress when eaglet opens an external document/link
    const handleDocumentOpen = () => {
        if (!hasReported50.current && item?.id) {
            hasReported50.current = true;
            updateProgress({
                itemId: item.id,
                data: { progress_percentage: 50, watch_duration_seconds: 0 },
            });
        }
    };

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 p-safe">
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
                        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.content_type === 'video' ? 'bg-blue-100 text-blue-600' :
                                        item.content_type === 'document' ? 'bg-orange-100 text-orange-600' :
                                            'bg-purple-100 text-purple-600'
                                    }`}>
                                    <span className="material-symbols-outlined">
                                        {item.content_type === 'video' ? 'play_circle' : item.content_type === 'document' ? 'description' : 'link'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h2>
                                    {item.points_value > 0 && (
                                        <p className="text-sm font-medium text-amber-600">
                                            Reward: {item.points_value} points
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            {item.content_type === 'video' ? (
                                <div className="w-full bg-black rounded-xl overflow-hidden shadow-sm shadow-black/20">
                                    <video
                                        ref={videoRef}
                                        src={item.file_url}
                                        controls
                                        className="w-full h-auto aspect-video object-contain"
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={handleEnded}
                                        controlsList="nodownload"
                                        playsInline
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : item.content_type === 'document' || item.content_type === 'link' ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center shadow-inner">
                                        <span className="material-symbols-outlined text-5xl text-slate-400">
                                            {item.content_type === 'document' ? 'auto_stories' : 'open_in_new'}
                                        </span>
                                    </div>

                                    <div className="text-center max-w-md">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                                            {item.content_type === 'document' ? 'Read Document' : 'External Link'}
                                        </h3>
                                        <p className="text-slate-500 mb-6">
                                            Please click the button below to view the file in a new tab. Make sure to come back and mark it as completed to earn your points.
                                        </p>

                                        <a
                                            href={item.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleDocumentOpen}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                        >
                                            <span className="material-symbols-outlined">launch</span>
                                            Open {item.content_type === 'document' ? 'Document' : 'Link'}
                                        </a>
                                    </div>

                                    <div className="w-full border-t border-slate-200 my-4"></div>

                                    <button
                                        onClick={handleDocumentComplete}
                                        disabled={isSaving || progressPercentage >= 100}
                                        className={`inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl shadow-lg transition-all ${progressPercentage >= 100
                                                ? 'bg-green-500 text-white shadow-green-500/20'
                                                : isSaving
                                                    ? 'bg-primary/70 text-white cursor-not-allowed'
                                                    : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {progressPercentage >= 100 ? (
                                            <>
                                                <span className="material-symbols-outlined">check_circle</span>
                                                Completed
                                            </>
                                        ) : isSaving ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin hidden">sync</span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">task_alt</span>
                                                Mark as Completed
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500">
                                    Unsupported content type.
                                </div>
                            )}
                        </div>

                        {/* Progress Bar (Global for Modal) */}
                        {item.content_type === 'video' && (
                            <div className="w-full h-1.5 bg-slate-200">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                ></div>
                            </div>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ContentItemViewerModal;
