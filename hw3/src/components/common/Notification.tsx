import { Snackbar, Alert } from '@mui/material';
import type { NotificationSeverity } from '../../hooks/useNotification';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  onClose: () => void;
  autoHideDuration?: number;
}

export function Notification({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000
}: NotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
