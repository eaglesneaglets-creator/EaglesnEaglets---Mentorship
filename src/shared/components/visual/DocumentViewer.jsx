import React from 'react';
import { motion } from 'framer-motion';
import { sanitizeUrl } from '../../utils/sanitize';

const DocumentViewer = ({ url, title }) => {
    const isPDF = url?.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
    const safeUrl = sanitizeUrl(url);

    if (!safeUrl || typeof safeUrl !== 'string') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2">find_in_page</span>
                <p>No valid document URL provided</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/5 border border-slate-200"
        >
            {isPDF ? (
                <iframe
                    src={`${safeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title={title || "Document Viewer"}
                    className="w-full h-full border-none"
                    loading="lazy"
                />
            ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
                    <img
                        src={safeUrl}
                        alt={title || "Content"}
                        className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                    />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <span className="material-symbols-outlined text-4xl font-light text-primary">description</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Preview Not Available</h3>
                    <p className="text-slate-500 max-w-sm mb-8">
                        This file type may not support inline viewing. You can open it in a new tab to see the full content.
                    </p>
                    <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">launch</span>
                        Open Externally
                    </a>
                </div>
            )}
        </motion.div>
    );
};

export default DocumentViewer;
