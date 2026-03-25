import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { sanitizeUrl, stripCloudinarySignature } from '../../utils/sanitize';

const DocumentViewer = ({ url, title, type }) => {
    const safeUrl = stripCloudinarySignature(sanitizeUrl(url));

    if (!safeUrl || typeof safeUrl !== 'string') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2">find_in_page</span>
                <p>No valid document URL provided</p>
            </div>
        );
    }

    // Treat as PDF if the content type explicitly indicates it, OR if the URL matches
    // known PDF/document path patterns (Cloudinary raw, backend /cvs/, /documents/).
    const isPDF =
        ['reading', 'document', 'pdf'].includes(type) ||
        /\.pdf(\?.*)?$/i.test(safeUrl) ||
        safeUrl.includes('/cvs/') ||
        safeUrl.includes('/documents/') ||
        safeUrl.includes('/raw/upload/');
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(safeUrl);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/5 border border-slate-200"
        >
            {isPDF ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-red-400">picture_as_pdf</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{title || 'Document'}</h4>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                        Open this document in a new tab to view its full content.
                    </p>
                    <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                        Open PDF
                    </a>
                </div>
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

DocumentViewer.propTypes = {
    url: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
};

export default DocumentViewer;