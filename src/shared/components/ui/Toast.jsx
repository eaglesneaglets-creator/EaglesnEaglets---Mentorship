import { Toaster as SonnerToaster } from 'sonner';

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

export default Toaster;
