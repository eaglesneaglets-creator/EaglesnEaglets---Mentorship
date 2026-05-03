import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth-service';
import { useAuthStore } from '@store';
import { toast } from '@shared/components/ui/toast-utils';

export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ oldPassword, newPassword, newPasswordConfirm }) =>
      authService.changePassword(oldPassword, newPassword, newPasswordConfirm),
    onSuccess: () => {
      toast.success('Password updated.');
    },
  });

export const useRequestEmailChange = () =>
  useMutation({
    mutationFn: ({ newEmail, currentPassword }) =>
      authService.requestEmailChange(newEmail, currentPassword),
    onSuccess: (response, variables) => {
      toast.success(`Verification sent to ${variables.newEmail}. Check your inbox to confirm.`);
    },
  });

export const useConfirmEmailChange = () =>
  useMutation({
    mutationFn: (token) => authService.confirmEmailChange(token),
  });

export const useDeleteAccount = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ currentPassword }) => authService.deleteAccount(currentPassword),
    onSuccess: async () => {
      try {
        await logout();
      } catch {
        // logout failure is non-fatal — account already deleted server-side
      }
      toast.success('Account deleted.');
      navigate('/', { replace: true });
    },
  });
};
