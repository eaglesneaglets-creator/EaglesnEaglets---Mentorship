import { useEffect, useRef, useState } from 'react';

/**
 * useEmojiInsertion — emoji-picker behaviour for a controlled <textarea>.
 *
 * Owns the three things PostFeed and PostCommentSection each used to hand-copy:
 *   1. the picker's open/closed state,
 *   2. closing it on an outside click,
 *   3. inserting the chosen emoji AT THE CARET (not appended) and restoring the
 *      caret afterwards, so typing continues where the user left off.
 *
 * Attach `textareaRef` to the textarea and `pickerRef` to the picker's wrapper.
 *
 * @param {string} value                   the textarea's current value
 * @param {(next: string) => void} setValue its setter
 */
export function useEmojiInsertion(value, setValue) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);
  const textareaRef = useRef(null);

  // Listen only while open — no document-level listener for a closed picker.
  useEffect(() => {
    if (!showEmojiPicker) return undefined;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setValue(value.slice(0, start) + emoji.native + value.slice(end));
    setShowEmojiPicker(false);
    // The caret can only be moved after React has committed the new value.
    requestAnimationFrame(() => {
      const caret = start + emoji.native.length;
      textarea.selectionStart = caret;
      textarea.selectionEnd = caret;
      textarea.focus();
    });
  };

  return { showEmojiPicker, setShowEmojiPicker, pickerRef, textareaRef, handleEmojiSelect };
}
