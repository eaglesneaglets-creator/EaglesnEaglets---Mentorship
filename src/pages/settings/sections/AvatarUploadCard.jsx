import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '@store';
import Avatar from '../../../shared/components/ui/Avatar';
import { ConfirmModal } from '../../../shared/components/ui/ConfirmModal';
import {
  useUploadAvatar,
  useRemoveAvatar,
  avatarErrorMessage,
} from '../../../modules/profile/hooks/useAvatar';

/**
 * AvatarUploadCard — change or remove your profile picture (Phase 32-02).
 *
 * Deliberately has NO KYC status gate. The old `/auth/upload/picture/` endpoint
 * blocks once KYC is approved (correct for a verification artifact), which left
 * every onboarded user unable to change their photo. 32-01 added a separate
 * profile-avatar endpoint precisely so this card can always work.
 */

// Mirrors the server-side rules so the user gets told before a round trip.
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_MB = 2;

const validate = (file) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ACCEPTED.includes(file.type) && !ACCEPTED_EXT.includes(ext)) {
    return `Only JPG, PNG and WEBP images are allowed. You chose a .${ext || 'unknown'} file.`;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Image must be under ${MAX_MB} MB. Yours is ${mb} MB.`;
  }
  return null;
};

export default function AvatarUploadCard({ user: userProp = null }) {
  // Self-sufficient: reads the current user from the store so it can be dropped
  // anywhere in Settings. `user` remains an optional override for tests.
  const storeUser = useAuthStore((s) => s.user);
  const user = userProp || storeUser;

  const [feedback, setFeedback] = useState(null); // { type, message }
  const [localPreview, setLocalPreview] = useState('');
  const [confirm, setConfirm] = useState(null);
  const inputRef = useRef(null);

  const uploadMutation = useUploadAvatar();
  const removeMutation = useRemoveAvatar();

  // Revoke the object URL so the blob isn't leaked.
  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const hasPicture = Boolean(user?.avatar_url);
  const busy = uploadMutation.isPending || removeMutation.isPending;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    setFeedback(null);

    const problem = validate(file);
    if (problem) {
      // Rejected client-side — no request is sent.
      setFeedback({ type: 'error', message: problem });
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    uploadMutation.mutate(file, {
      onSuccess: () => setFeedback({ type: 'success', message: 'Profile picture updated.' }),
      onError: (err) => {
        setLocalPreview('');
        setFeedback({
          type: 'error',
          message: avatarErrorMessage(err, 'Could not upload the image. Please try again.'),
        });
      },
    });
  };

  const askRemove = () => {
    setConfirm({
      title: 'Remove profile picture?',
      message: 'Your picture will be removed from your profile.',
      confirmLabel: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        setFeedback(null);
        removeMutation.mutate(undefined, {
          onSuccess: () => {
            setLocalPreview('');
            setFeedback({ type: 'success', message: 'Profile picture removed.' });
          },
          onError: (err) =>
            setFeedback({
              type: 'error',
              message: avatarErrorMessage(err, 'Could not remove the image. Please try again.'),
            }),
        });
      },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar
          user={user}
          src={localPreview || undefined}
          size="xl"
          className="ring-4 ring-slate-100"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">Profile picture</p>
          <p className="text-xs text-slate-500 mt-0.5">
            JPG, PNG or WEBP · up to {MAX_MB} MB. Shown next to your name across the platform.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Label-triggered file input: keyboard reachable, no div onClick. */}
            <label
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                busy
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                photo_camera
              </span>
              {uploadMutation.isPending ? 'Uploading…' : hasPicture ? 'Change photo' : 'Upload photo'}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={busy}
                onChange={handleFile}
              />
            </label>

            {hasPicture && (
              <button
                type="button"
                onClick={askRemove}
                disabled={busy}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {removeMutation.isPending ? 'Removing…' : 'Remove'}
              </button>
            )}
          </div>

          {feedback && (
            <p
              className={`mt-2.5 text-xs ${
                feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

AvatarUploadCard.propTypes = {
  user: PropTypes.object,
};
