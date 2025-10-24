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
      <DialogTitle id="logout-dialog-title" sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Logout sx={{ fontSize: 24, color: '#ff6b35' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
            確認登出
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 2 }}>
        <DialogContentText id="logout-dialog-description" sx={{ fontSize: '1rem', color: 'text.secondary' }}>
          您確定要登出嗎？登出後需要重新登入才能使用完整功能。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            border: '2px solid #e0e0e0',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'black',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: '#000',
            },
          }}
        >
          取消
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          sx={{
            border: '2px solid #ff6b35',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#ff6b35',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#ff6b35',
              color: 'white',
            },
          }}
        >
          確認登出
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
