import { useState, useRef, useCallback } from 'react';
import { Camera, User, UploadCloud, CheckCircle2, FileText, X } from 'lucide-react';

export const PhotoUpload = ({ url, onChange, disabled }) => {
    const inputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onChange?.(reader.result, file);
        reader.readAsDataURL(file);
    }, [onChange]);

    return (
        <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                {url ? (
                    <img src={url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                )}
            </div>
            <div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                >
                    <Camera className="w-4 h-4" />
                    {url ? 'Replace photo' : 'Upload photo'}
                </button>
                <p className="text-xs text-slate-500 mt-2">JPG or PNG · square preferred · max 5MB</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>
        </div>
    );
};

export const FileDrop = ({ label, file, onChange, accept, hint, disabled }) => {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef(null);

    const handleFile = (f) => { if (f) onChange?.(f); };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                if (!disabled) handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => !disabled && inputRef.current?.click()}
            className={[
                'relative flex flex-col items-center justify-center gap-2 px-6 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition',
                drag ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50',
                file ? 'border-primary bg-primary/5' : '',
                disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {!file ? (
                <>
                    <UploadCloud className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                    <div className="text-sm font-bold text-slate-900">{label}</div>
                    <div className="text-xs text-slate-500">{hint}</div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        <FileText className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">{file.name}</div>
                    <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · click to replace</div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange?.(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </>
            )}
        </div>
    );
};
