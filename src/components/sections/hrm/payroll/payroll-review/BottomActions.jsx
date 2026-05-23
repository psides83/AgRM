import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useSnackbar } from 'notistack';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';

const BottomActions = () => {
  const { down } = useBreakpoints();
  const [open, setOpen] = useState(false);

  const downSm = down('sm');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      gap={2}
      sx={{ justifyContent: { sm: 'flex-end' } }}
    >
      <Stack gap={2} sx={{ ml: { xs: 0, sm: 'auto' } }}>
        <Button
          fullWidth={downSm}
          color="neutral"
          sx={{ textWrap: 'nowrap', flexShrink: { sm: 0 } }}
        >
          Cancel
        </Button>
        <Button
          fullWidth={downSm}
          variant="soft"
          color="neutral"
          sx={{ textWrap: 'nowrap', flexShrink: { sm: 0 } }}
        >
          Edit Payroll
        </Button>
      </Stack>
      <Button
        fullWidth={downSm}
        variant="contained"
        onClick={handleOpen}
        sx={{ textWrap: 'nowrap', flexShrink: { sm: 0 } }}
      >
        Approve Payroll
      </Button>
      <ApprovePayrollDialog open={open} onClose={handleClose} />
    </Stack>
  );
};

export default BottomActions;

const ApprovePayrollDialog = ({ sx, open, onClose, ...rest }) => {
  const { enqueueSnackbar } = useSnackbar();

  const onApprove = () => {
    enqueueSnackbar('Payroll approved!', { variant: 'success' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      {...rest}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          p: 3,
          maxWidth: 463,
          ...sx,
        },
      }}
    >
      <DialogTitle
        sx={{ p: 0, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box component="span">Approve Payroll</Box>
        <Button shape="circle" color="neutral" size="small" onClick={onClose}>
          <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ mb: 2, p: { xs: 0 } }}>
        <DialogContentText sx={{ typography: 'body2' }}>
          Approve payroll for Oct 1 - Oct 31, 2025? Once confirmed, payment can be made on Oct 3,
          2025.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 0 } }}>
        <Button variant="soft" color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onApprove}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
