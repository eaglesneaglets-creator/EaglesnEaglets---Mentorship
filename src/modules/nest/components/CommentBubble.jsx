// src/modules/nest/components/CommentBubble.jsx
import React, { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddReply } from '../hooks/useAddReply';

/**
 * Renders a single top-level comment with inline reply input and collapsible reply list.
 * Replies cannot themselves be replied to (one level only).
 */
const CommentBubble = ({ comment, postId, nestId }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const replyInputRef = useRef(null);
  const { mutate: addReply, isPending } = useAddReply(comment.id, postId, nestId);

  const author = comment.author_details;
  const replies = comment.replies || [];
  const timestamp = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : '';

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    addReply(
      { content: replyText.trim() },
      {
        onSuccess: () => {
          setReplyText('');
          setIsReplying(false);
          setShowReplies(true);
        },
      }
    );
  };

  return (
    <div className="flex gap-2.5">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
        {author?.first_name?.[0] || '?'}
      </div>

      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
          <p className="text-xs font-bold text-slate-900">
            {author?.first_name} {author?.last_name}
          </p>
          <p className="text-sm text-slate-700 mt-0.5 break-words">{comment.content}</p>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-[10px] text-slate-400">{timestamp}</span>
          <button
            onClick={() => {
              setIsReplying(!isReplying);
              if (!isReplying) setTimeout(() => replyInputRef.current?.focus(), 50);
            }}
            className="text-[11px] font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            Reply
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              {showReplies ? 'Hide replies' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>

        {/* Inline reply input */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 ml-2 flex gap-2 items-end overflow-hidden"
            >
              <textarea
                ref={replyInputRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder="Write a reply..."
                rows={1}
                className="flex-1 text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all min-w-0"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || isPending}
                className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies list */}
        <AnimatePresence>
          {showReplies && replies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 ml-4 flex flex-col gap-2 border-l-2 border-slate-100 pl-3 overflow-hidden"
            >
              {replies.map((reply) => {
                const replyAuthor = reply.author_details;
                const replyTime = reply.created_at
                  ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
                  : '';
                return (
                  <div key={reply.id} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {replyAuthor?.first_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3 py-2">
                        <p className="text-[11px] font-bold text-slate-900">
                          {replyAuthor?.first_name} {replyAuthor?.last_name}
                        </p>
                        <p className="text-xs text-slate-700 mt-0.5 break-words">{reply.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-1">{replyTime}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentBubble;
