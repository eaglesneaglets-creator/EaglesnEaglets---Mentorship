// src/modules/nest/components/PostCommentSection.jsx
import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
const Picker = lazy(() => import('@emoji-mart/react'));
import { usePostComments } from '../hooks/usePostComments';
import { useAddComment } from '../hooks/useAddComment';
import CommentBubble from './CommentBubble';
import { useAuthStore } from '@store';

/**
 * Inline comment section rendered below a PostCard when comments are open.
 * Fetches comments on mount, shows CommentBubble list, handles new comment + emoji picker.
 */
const PostCommentSection = ({ postId, nestId }) => {
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useAuthStore();

  const { data: comments = [], isLoading } = usePostComments(postId, nestId, true);
  const { mutate: addComment, isPending } = useAddComment(postId, nestId);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  const handleSend = () => {
    if (!commentText.trim()) return;
    addComment({ content: commentText.trim() }, { onSuccess: () => setCommentText('') });
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setCommentText(commentText.slice(0, start) + emoji.native + commentText.slice(end));
    setShowEmojiPicker(false);
    requestAnimationFrame(() => {
      textarea.selectionStart = start + emoji.native.length;
      textarea.selectionEnd = start + emoji.native.length;
      textarea.focus();
    });
  };

  return (
    <div className="border-t border-slate-100 pt-3 px-4 pb-4 flex flex-col gap-3">
      {/* Comment list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <span className="material-symbols-outlined text-slate-300 text-xl animate-spin">
            progress_activity
          </span>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-slate-400 italic py-2">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              postId={postId}
              nestId={nestId}
            />
          ))}
        </div>
      )}

      {/* New comment input */}
      <div className="flex gap-2 items-end relative">
        {/* Current user avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.first_name?.[0] || '?'}
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a comment..."
            rows={1}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-2.5 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">sentiment_satisfied</span>
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div ref={pickerRef} className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-2xl overflow-hidden">
              <Suspense fallback={<div className="w-8 h-8 animate-pulse bg-slate-100 rounded" />}>
                <Picker data={() => import('@emoji-mart/data').then(m => m.default)} onEmojiSelect={handleEmojiSelect} theme="light" />
              </Suspense>
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!commentText.trim() || isPending}
          className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </div>
    </div>
  );
};

export default PostCommentSection;
