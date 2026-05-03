import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './_shared';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const EmojiPicker = ({ onSelect, isOwn }) => (
    <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-9 z-20 flex items-center gap-1 bg-white border border-slate-100 rounded-full shadow-lg px-2 py-1`}>
        {QUICK_EMOJIS.map((emoji) => (
            <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="text-base hover:scale-125 transition-transform duration-150 leading-none"
            >
                {emoji}
            </button>
        ))}
    </div>
);

export default function MessageBubble({ message, isOwn, showAvatar, senderName, reactions, onReact }) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        if (!showPicker) return;
        const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPicker]);

    const msgReactions = reactions?.[message.id] || {};
    const hasReactions = Object.keys(msgReactions).length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            {!isOwn && showAvatar ? <Avatar name={senderName} size="sm" /> : !isOwn ? <div className="w-8 h-8 flex-shrink-0" /> : null}
            <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="relative" ref={pickerRef}>
                    {showPicker && !message.is_deleted && (
                        <EmojiPicker isOwn={isOwn} onSelect={(emoji) => { onReact(message.id, emoji); setShowPicker(false); }} />
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md shadow-sm'}`}>
                        {message.is_deleted ? <em className="text-slate-400">[deleted]</em> : message.content}
                    </div>
                    {!message.is_deleted && (
                        <button
                            onClick={() => setShowPicker((v) => !v)}
                            className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-7' : '-right-7'} opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-xs`}
                        >
                            😊
                        </button>
                    )}
                </div>

                {hasReactions && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(msgReactions).map(([emoji, users]) => (
                            users.size > 0 && (
                                <button
                                    key={emoji}
                                    onClick={() => onReact(message.id, emoji)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs transition-colors border border-slate-200"
                                >
                                    {emoji} <span className="font-semibold text-slate-600">{users.size}</span>
                                </button>
                            )
                        ))}
                    </div>
                )}

                <p className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
}
