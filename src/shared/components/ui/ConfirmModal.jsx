/**
 * ConfirmModal — confirmation for destructive or important actions.
 * Built on shadcn/ui AlertDialog: unlike a normal dialog it cannot be
 * dismissed by clicking outside, and focus starts on Cancel so a stray
 * Enter never confirms a destructive action.
 *
 * Usage (unchanged):
 *   const [confirm, setConfirm] = useState(null);
 *   // trigger: setConfirm({ title, message, onConfirm })
 *   <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
 */

import PropTypes from 'prop-types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ConfirmModal({ config, onClose }) {
  const {
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    variant = 'danger',
    onConfirm,
  } = config || {};

  return (
    <AlertDialog open={!!config} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {message
            ? <AlertDialogDescription>{message}</AlertDialogDescription>
            : <AlertDialogDescription className="sr-only">Confirm this action.</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

ConfirmModal.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    confirmLabel: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'primary']),
    onConfirm: PropTypes.func.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};
