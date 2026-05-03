import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MessageInput({ onSend, disabled }) {
    const [text, setText] = useState('');
    const handleSend = () => {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };
    return (
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={disabled ? 'Connecting...' : 'Type a message...'}
                        disabled={disabled}
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-50"
                        style={{ maxHeight: '120px' }}
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-0.5 shadow-sm shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">send</span>
                </motion.button>
            </div>
        </div>
    );
}
