import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { appraisalList } from 'data/hrm/performance-management';
import { users } from 'data/users';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import IconifyIcon from 'components/base/IconifyIcon';
import useAddMemberForm from './useAddMemberForm';

const members = appraisalList.map((appraisal) => appraisal.member);
const mainEvaluators = appraisalList.map((appraisal) => appraisal.mainEvaluator);

const AddMemberDialog = ({ sx, onClose, handleClose, ...rest }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useAddMemberForm();
  const { enqueueSnackbar } = useSnackbar();

  const startDate = watch('startDate');

  const onSubmit = (data) => {
    console.log('Add Member Data', data);
    enqueueSnackbar('Member added successfully', { variant: 'success' });
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
        Add Member in Appraisal List
        <Button shape="circle" color="neutral" onClick={handleClose}>
          <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20, color: 'neutral.dark' }} />
        </Button>
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Choose a member, assign their department and evaluators, and configure appraisal settings
          for this cycle.
        </DialogContentText>
        <Grid container rowSpacing={2} columnSpacing={1}>
          <Grid size={6}>
            <Controller
              control={control}
              name="member"
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  options={members}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => {
                    return (
                      <TextField
                        label="Member"
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
              name="department"
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  options={['Engineering', 'Design', 'Support', 'Marketing', 'HRM']}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => {
                    return (
                      <TextField
                        label="Department"
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
          <Grid container size={12} rowSpacing={1}>
            <Grid size={12}>
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
            <Grid size={12}>
              <Controller
                control={control}
                name="appraisalName"
                render={({ field }) => (
                  <Autocomplete
                    fullWidth
                    options={[
                      'Mid-Year Appraisal',
                      'Year-End Appraisal',
                      'Quarterly Review',
                      'Project Evaluation',
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
              name="endDate"
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
              name="otherEvaluators"
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  options={users}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => {
                    return (
                      <TextField
                        label="Other Evaluator"
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

export default AddMemberDialog;
