import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

/**
 * toast — platform-branded toast notifications via Sonner
 *
 * Usage:
 *   import { toast } from '@shared/components/ui/Toast';
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

/**
 * Toaster — place once in App.jsx root
 *
 * <Toaster />
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        },
      }}
    />
  );
}

export default toast;
