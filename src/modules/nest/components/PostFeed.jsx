// src/modules/nest/components/PostFeed.jsx
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const Picker = lazy(() => import('@emoji-mart/react'));
import { useAuthStore } from '@store';
import { useNestPosts, useCreatePost } from '../hooks/useNests';
import { useToggleLike } from '../hooks/useToggleLike';
import { useUploadMedia } from '../hooks/useUploadMedia';
import PostCommentSection from './PostCommentSection';
import { formatDistanceToNow } from 'date-fns';

// ---------------------------------------------------------------------------
// PostComposer — create new post with emoji + file upload
// ---------------------------------------------------------------------------

const PostComposer = ({ nestId, user }) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null); // { url, type }
  const fileInputRef = useRef(null);
  const pickerRef = useRef(null);
  const textareaRef = useRef(null);
  const { upload, progress, isUploading, reset: resetUpload } = useUploadMedia();
  const createMutation = useCreatePost(nestId);

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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await upload(file);
      setAttachment(result);
    } catch { /* toast shown inside hook */ }
    e.target.value = '';
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setContent(content.slice(0, start) + emoji.native + content.slice(end));
    setShowEmojiPicker(false);
    requestAnimationFrame(() => {
      textarea.selectionStart = start + emoji.native.length;
      textarea.selectionEnd = start + emoji.native.length;
      textarea.focus();
    });
  };

  const handlePost = () => {
    if (!content.trim()) return;
    createMutation.mutate(
      {
        content,
        post_type: 'post',
        ...(attachment ? { attachment_url: attachment.url, attachment_type: attachment.type } : {}),
      },
      {
        onSuccess: () => {
          setContent('');
          setAttachment(null);
          resetUpload();
          setIsFocused(false);
        },
      }
    );
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border transition-all ${isFocused ? 'border-primary/30 shadow-primary/10 shadow-lg' : 'border-slate-100'}`}>
      {/* Emoji picker — hoisted to card level so it isn't clipped by the toolbar's height animation */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 z-50">
          <Suspense fallback={<div className="w-8 h-8 animate-pulse bg-slate-100 rounded" />}>
            <Picker data={() => import('@emoji-mart/data').then(m => m.default)} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" />
          </Suspense>
        </div>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Share an update, assignment, or resource..."
              rows={isFocused ? 3 : 1}
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Attachment preview */}
        {attachment && (
          <div className="mt-2 ml-13 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-500 text-lg">
              {attachment.type === 'image' ? 'image' : attachment.type === 'video' ? 'videocam' : 'attach_file'}
            </span>
            <span className="text-xs text-slate-600 flex-1 truncate">Attachment ready</span>
            <button
              onClick={() => { setAttachment(null); resetUpload(); }}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Toolbar — shown when focused */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 pb-4 flex justify-between items-center border-t border-slate-100 pt-3">
              <div className="flex gap-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-9 h-9 flex items-center justify-center text-amber-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Emoji"
                >
                  <span className="material-symbols-outlined text-xl">mood</span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
                  title="Attach file"
                >
                  <span className="material-symbols-outlined text-xl">attach_file</span>
                </button>
              </div>

              <button
                onClick={handlePost}
                disabled={!content.trim() || createMutation.isPending || isUploading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                {createMutation.isPending ? 'Posting...' : 'Post'}
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PostCard — individual post with like + inline comment section
// ---------------------------------------------------------------------------

const PostCard = ({ post, nestId }) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { mutate: toggleLike } = useToggleLike(post.id, nestId);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Post header */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 mt-0.5">
              {post.author_details?.first_name?.charAt(0) || '?'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {post.author_details?.first_name} {post.author_details?.last_name}
                {post.author_details?.role === 'eagle' && (
                  <span className="font-normal text-slate-500 text-xs ml-1">• Mentor</span>
                )}
              </h4>
              <p className="text-xs text-slate-500">
                {post.created_at
                  ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                  : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-slate-800 text-sm mb-4 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Attachment */}
        {post.attachment_url && post.attachment_type === 'image' && (
          <img
            src={post.attachment_url}
            alt="Post attachment"
            loading="lazy"
            className="rounded-xl w-full object-cover max-h-80 mb-4"
          />
        )}
        {post.attachment_url && post.attachment_type === 'video' && (
          <video src={post.attachment_url} controls className="rounded-xl w-full max-h-80 mb-4" />
        )}
        {post.attachment_url && post.attachment_type === 'file' && (
          <a
            href={post.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-sm text-primary font-medium mb-4"
          >
            <span className="material-symbols-outlined text-lg">attach_file</span>
            Download Attachment
          </a>
        )}
      </div>

      {/* Action bar */}
      <div className="px-5 pb-3 flex items-center gap-5 border-t border-slate-50 pt-2.5">
        {/* Like button */}
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={() => toggleLike()}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            post.liked_by_me ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
          }`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: post.liked_by_me ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
          <span>{post.likes_count || 0}</span>
        </motion.button>

        {/* Comment toggle */}
        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            commentsOpen ? 'text-primary' : 'text-slate-400 hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-xl">chat_bubble_outline</span>
          <span>{post.comments_count || 0}</span>
        </button>
      </div>

      {/* Inline comment section — collapses via max-height CSS */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          commentsOpen ? 'max-h-[600px]' : 'max-h-0'
        }`}
      >
        {commentsOpen && <PostCommentSection postId={post.id} nestId={nestId} />}
      </div>
    </motion.article>
  );
};

// ---------------------------------------------------------------------------
// PostFeed — main export
// ---------------------------------------------------------------------------

const PostFeed = ({ nestId }) => {
  const { user } = useAuthStore();
  const { data: postsData, isLoading } = useNestPosts(nestId);
  const posts = postsData?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PostComposer nestId={nestId} user={user} />

      {isLoading && (
        <div className="text-center py-8 text-slate-400 text-sm">Loading posts...</div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} nestId={nestId} />
      ))}

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500">No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
