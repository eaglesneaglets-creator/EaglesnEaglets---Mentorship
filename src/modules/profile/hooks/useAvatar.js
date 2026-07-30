/**
 * useAvatar — profile-picture upload/remove hooks (Phase 32-02).
 *
 * Both mutations refresh the CURRENT USER, not just the Settings preview: the
 * avatar appears in the sidebar, header, chat and elsewhere, so a successful
 * upload has to invalidate `['auth','me']` and re-sync the auth store. Follows
 * the same pattern as useMentorApplication (plan 16-02) rather than inventing a
 * second refresh path.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@store';
import { profileService } from '../services/profile-service';

const authMeKey = ['auth', 'me'];

/** Pull the human-readable reason out of the API error envelope. */
export const avatarErrorMessage = (err, fallback) =>
  err?.response?.data?.error?.message
  || err?.details?.message
  || err?.message
  || fallback;

function useAvatarMutation(mutationFn) {
  const qc = useQueryClient();
  const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);

  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authMeKey });
      // Re-sync the store so every avatar on screen updates, not just this card.
      // `force` is required: DashboardLayout refreshes on window focus, and the
      // OS file picker blurs the window — so an unforced call here almost always
      // lands inside the 5s throttle and gets dropped, leaving the sidebar on
      // initials until a hard reload.
      refreshAccessStatus?.({ force: true });
    },
  });
}

export function useUploadAvatar() {
  return useAvatarMutation((file) => profileService.uploadAvatar(file));
}

export function useRemoveAvatar() {
  return useAvatarMutation(() => profileService.removeAvatar());
}
