import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { appraisalList } from 'data/hrm/performance-management';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import DateRangePicker from 'components/base/DateRangePicker';
import IconifyIcon from 'components/base/IconifyIcon';
import useNewCycleForm from './useNewCycleForm';

const mainEvaluators = appraisalList.map((appraisal) => appraisal.mainEvaluator);

const NewCycleDialog = ({ sx, onClose, handleClose, ...rest }) => {
  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = useNewCycleForm();
  const { enqueueSnackbar } = useSnackbar();

  const startDate = watch('startDate');

  const onSubmit = (data) => {
    console.log('New Cycle Data', data);
    enqueueSnackbar('New Cycle created successfully', { variant: 'success' });
    handleClose();
  };

  return (
    <Dialog
      scroll="body"
      maxWidth={false}
      onClose={onClose}
      slotProps={{
        paper: {
          component: 'form',
          id: 'add-member-form',
          onSubmit: handleSubmit(onSubmit),
        },
      }}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: 'visible',
          maxWidth: 600,
          ...sx,
        },
      }}
      {...rest}
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
        Create Appraisal Cycle
        <Button shape="circle" color="neutral" onClick={handleClose}>
          <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20, color: 'neutral.dark' }} />
        </Button>
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Set up a new appraisal cycle by defining its name, review period, duration and evaluation
          template.
        </DialogContentText>
        <Grid container rowSpacing={2} columnSpacing={1}>
          <Grid container size={12} rowSpacing={1}>
            <Grid size={12}>
              <TextField
                label="Cycle Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth error={!!errors.reviewPeriod} sx={{ mb: 1 }}>
                <Controller
                  name="reviewPeriod"
                  control={control}
                  render={({ field }) => (
                    <DateRangePicker
                      className="react-datepicker-class"
                      selected={field.value?.[0] || undefined}
                      startDate={field.value?.[0] || undefined}
                      endDate={field.value?.[1] || undefined}
                      onChange={(dates) => {
                        field.onChange(dates);
                      }}
                      withPortal
                      isClearable
                      customInput={
                        <TextField
                          label="Review Period"
                          fullWidth
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <IconifyIcon icon="material-symbols:calendar-month-outline-rounded" />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      }
                    />
                  )}
                />

                {errors.reviewPeriod && (
                  <FormHelperText>{errors.reviewPeriod?.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
          <Grid size={6}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Start Date"
                  format="DD/MM/YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.toDate() : null);
                  }}
                  slotProps={{
                    textField: {
                      error: !!errors.startDate,
                      helperText: errors.startDate?.message,
                    },
                  }}
                  sx={{
                    width: 1,
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Due Date"
                  format="DD/MM/YYYY"
                  shouldDisableDate={(date) => date.isBefore(dayjs(startDate))}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.toDate() : null);
                  }}
                  slotProps={{
                    textField: {
                      error: !!errors.startDate,
                      helperText: errors.startDate?.message,
                    },
                  }}
                  sx={{
                    width: 1,
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              control={control}
              name="mainEvaluator"
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  options={mainEvaluators}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => {
                    return (
                      <TextField
                        label="Main Evaluator"
                        slotProps={{
                          input: {
                            ...params.InputProps,
                          },
                        }}
                        sx={{ flexGrow: 1 }}
                        {...params}
                      />
                    );
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              control={control}
              name="template"
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  options={[
                    'Annual Review',
                    'Probation Review',
                    '360 Feedback',
                    'Performance Check-in',
                  ]}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => {
                    return (
                      <TextField
                        label="Template"
                        slotProps={{
                          input: {
                            ...params.InputProps,
                          },
                        }}
                        sx={{ flexGrow: 1 }}
                        {...params}
                      />
                    );
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          pt: 0.5,
        }}
      >
        <Button variant="soft" color="neutral" onClick={handleClose}>
          Discard
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewCycleDialog;
