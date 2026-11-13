import { toast as sonnerToast } from 'sonner';

/**
 * toast — the app's ONLY toast API (Sonner, mounted once by <Toaster/> in App.jsx).
 *
 *   import { toast } from '@shared/components/ui/toast-utils';
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.promise(apiCall(), { loading: 'Saving...', success: 'Done!', error: 'Failed' });
 *
 * Don't import from 'sonner' or another toast library directly: a toast from a
 * library with no mounted <Toaster/> is silently dropped (this happened to
 * ~120 messages that called react-hot-toast).
 *
 * Colours come from the theme tokens in index.css and pass WCAG AA for white text.
 */
const solid = (background) => ({ background, color: '#fff', border: 'none' });

export const toast = {
  success: (message, options) =>
    sonnerToast.success(message, { style: solid('var(--color-primary)'), ...options }),

  error: (message, options) =>
    sonnerToast.error(message, { style: solid('var(--color-destructive)'), ...options }),

  info: (message, options) =>
    sonnerToast(message, { style: solid('var(--color-foreground)'), ...options }),

  // Amber needs dark text for contrast.
  warning: (message, options) =>
    sonnerToast.warning(message, {
      style: { background: '#FCD34D', color: '#422006', border: 'none' },
      ...options,
    }),

  loading: (message, options) => sonnerToast.loading(message, options),

  promise: (promise, messages, options) => sonnerToast.promise(promise, messages, options),

  dismiss: (id) => sonnerToast.dismiss(id),
};
