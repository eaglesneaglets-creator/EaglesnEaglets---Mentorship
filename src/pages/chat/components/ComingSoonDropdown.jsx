import { useRef, useEffect } from 'react';

export default function ComingSoonDropdown({ onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 px-4 flex items-center gap-2 whitespace-nowrap animate-fade-in"
        >
            <span className="material-symbols-outlined text-base text-amber-400">schedule</span>
            <span className="text-sm font-medium text-slate-600">Coming Soon</span>
        </div>
    );
}
