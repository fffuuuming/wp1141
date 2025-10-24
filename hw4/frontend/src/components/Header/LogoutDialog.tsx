import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { sx, colors } from '../../styles';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 400,
        },
      }}
    >
      <DialogTitle id="logout-dialog-title" sx={sx.textCenter}>
        <Box sx={sx.flexCenter}>
          <Logout sx={{ fontSize: 24, color: colors.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
            確認登出
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={sx.textCenter}>
        <DialogContentText id="logout-dialog-description" sx={{ fontSize: '1rem', color: 'text.secondary' }}>
          您確定要登出嗎？登出後需要重新登入才能使用完整功能。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={sx.flexCenter}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={sx.secondaryButton}
        >
          取消
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          sx={sx.primaryButton}
        >
          確認登出
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
