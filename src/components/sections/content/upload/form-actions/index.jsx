import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Alert, Button, Paper, Snackbar, Stack } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import ScheduleDialog from './ScheduleDialog';

const FormActions = () => {
  const { up } = useBreakpoints();
  const upSm = up('sm');

  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    handleSubmit,
    getValues,
    reset,
    formState: { isSubmitting },
  } = useFormContext();

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCancel = () => {
    reset({}, { keepDefaultValues: true });
    showSnackbar('Form reset successfully', 'info');
  };

  const handleSaveDraft = () => {
    const formData = getValues();
    console.log('Draft saved:', formData);

    showSnackbar('Draft saved successfully!', 'success');
  };

  const handleScheduleSubmit = (scheduleData) => {
    if (!scheduleData.date || !scheduleData.time) {
      showSnackbar('Please select both date and time', 'error');
      return;
    }

    const scheduledDateTime = scheduleData.date
      .hour(scheduleData.time.hour())
      .minute(scheduleData.time.minute());

    const formData = getValues();
    console.log('Scheduled post:', { ...formData, scheduledAt: scheduledDateTime.toISOString() });

    reset({}, { keepDefaultValues: true });
    setOpen(false);

    const formattedDate = scheduledDateTime.format('MMMM D, YYYY [at] h:mm A');
    showSnackbar(`Blog scheduled for ${formattedDate}`, 'success');
  };

  const handlePublish = handleSubmit((data) => {
    console.log('Publishing blog:', data);
    reset({}, { keepDefaultValues: true });
    showSnackbar('Blog published successfully!', 'success');
  });

  return (
    <>
      <Paper
        variant="elevation"
        background={1}
        elevation={0}
        sx={{
          p: { xs: 1, sm: 2 },
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Button
          type="button"
          color="neutral"
          shape={!upSm ? 'square' : undefined}
          sx={{ flexShrink: 0 }}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {!upSm ? (
            <IconifyIcon
              icon="material-symbols:close-rounded"
              sx={{ fontSize: 18, color: 'error.main' }}
            />
          ) : (
            'Cancel'
          )}
        </Button>

        <Stack
          sx={{
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Button type="button" color="neutral" onClick={handleSaveDraft} disabled={isSubmitting}>
            Save {upSm && 'Draft'}
          </Button>
          <Button
            type="button"
            variant="soft"
            color="neutral"
            onClick={() => setOpen(true)}
            disabled={isSubmitting}
          >
            Schedule {upSm && 'for later'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            Publish {upSm && 'Now'}
          </Button>
        </Stack>
      </Paper>

      <ScheduleDialog
        open={open}
        handleDialogClose={() => setOpen(false)}
        onSubmit={handleScheduleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FormActions;
