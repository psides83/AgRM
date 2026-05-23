import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  dialogClasses,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';

const ScheduleDialog = (props) => {
  const { open, handleDialogClose, onSubmit, sx, ...dialogProps } = props;

  const [formValue, setFormValue] = useState({
    date: dayjs(),
    time: dayjs(),
  });
  const [timeOpen, setTimeOpen] = useState(false);

  const handleChange = (name, value) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formValue.date || !formValue.time) {
      return;
    }

    onSubmit({ date: formValue.date, time: formValue.time });
    handleDialogClose();
    setFormValue({ date: dayjs(), time: dayjs() });
  };

  const handleDialogCloseClick = () => {
    handleDialogClose();
    setFormValue({ date: dayjs(), time: dayjs() });
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogCloseClick}
      maxWidth={false}
      {...dialogProps}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: 'visible',
          maxWidth: 463,
          ...sx,
        },
      }}
    >
      <DialogTitle
        component="h6"
        sx={{
          pt: 3,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Schedule
        <IconButton onClick={handleDialogCloseClick}>
          <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20, color: 'neutral.dark' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3, position: 'relative' }}>
        <DialogContentText
          variant="body2"
          sx={{ color: 'text.secondary', mb: 2, textWrap: 'pretty' }}
        >
          Make your schedule to publish your content in your preferable date and time.
        </DialogContentText>

        <Grid container spacing={2}>
          <Grid size={{ xs: 7, md: 9 }}>
            <DatePicker
              format="DD MMM, YYYY"
              value={formValue.date}
              onChange={(newDate) => handleChange('date', newDate)}
              minDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: 'Select date',
                },
              }}
              slots={{
                textField: StyledTextField,
                openPickerButton: (iconButtonProps) => (
                  <IconButton {...iconButtonProps}>
                    <IconifyIcon
                      icon="material-symbols:keyboard-arrow-down-rounded"
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 5, md: 3 }}>
            <TimePicker
              value={formValue.time}
              format="hh:mm A"
              open={timeOpen}
              onOpen={() => setTimeOpen(true)}
              onClose={() => setTimeOpen(false)}
              onChange={(newTime) => handleChange('time', newTime)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  onClick: () => setTimeOpen(true),
                  placeholder: 'Time',
                },
              }}
              slots={{
                textField: StyledTextField,
                openPickerButton: () => null,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end' }}>
        <Stack sx={{ gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="soft" color="neutral" onClick={handleDialogCloseClick}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!formValue.date || !formValue.time}
          >
            Schedule
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog;
