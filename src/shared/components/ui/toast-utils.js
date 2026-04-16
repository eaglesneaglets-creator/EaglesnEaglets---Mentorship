import { toast as sonnerToast } from 'sonner';

/**
 * toast — platform-branded toast notifications via Sonner
 *
 * Usage:
 *   import { toast } from '@shared/components/ui/toast';
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.promise(apiCall(), { loading: 'Saving...', success: 'Done!', error: 'Failed' });
 */
export const toast = {
  success: (message, options) =>
    sonnerToast.success(message, {
      style: { background: '#22c55e', color: '#fff', border: 'none' },
      ...options,
    }),

  error: (message, options) =>
    sonnerToast.error(message, {
      style: { background: '#ef4444', color: '#fff', border: 'none' },
      ...options,
    }),

  info: (message, options) =>
    sonnerToast(message, {
      style: { background: '#0f172a', color: '#fff', border: 'none' },
      ...options,
    }),

  warning: (message, options) =>
    sonnerToast.warning(message, {
      style: { background: '#f59e0b', color: '#fff', border: 'none' },
      ...options,
    }),

  loading: (message, options) =>
    sonnerToast.loading(message, options),

  promise: (promise, messages, options) =>
    sonnerToast.promise(promise, messages, options),

  dismiss: (id) => sonnerToast.dismiss(id),
};

export default toast;
