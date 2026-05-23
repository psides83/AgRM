import { Controller, useFormContext } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const GoalDetailsForm = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <Stack direction="column" gap={2}>
      <Typography fontWeight={700}>Goal Details</Typography>
      <Grid container spacing={1}>
        <Grid size={12}>
          <TextField
            label="Goal Name"
            fullWidth
            error={!!errors.goalDetails?.name}
            helperText={errors.goalDetails?.name?.message}
            {...register('goalDetails.name')}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Short Description"
            multiline
            rows={3}
            fullWidth
            error={!!errors.goalDetails?.description}
            helperText={errors.goalDetails?.description?.message}
            {...register('goalDetails.description')}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid size={6}>
          <Controller
            control={control}
            name="goalDetails.startDate"
            render={({ field: { value, onChange, ...rest } }) => (
              <DatePicker
                label="Start Date"
                value={dayjs(value)}
                onChange={(date) => onChange(date)}
                slotProps={{
                  textField: {
                    error: !!errors.goalDetails?.startDate,
                    helperText: errors.goalDetails?.startDate?.message,
                    fullWidth: true,
                  },
                  inputAdornment: {
                    position: 'start',
                  },
                }}
                {...rest}
              />
            )}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            control={control}
            name="goalDetails.dueDate"
            render={({ field: { value, onChange, ...rest } }) => (
              <DatePicker
                label="Due Date"
                value={dayjs(value)}
                onChange={(date) => onChange(date)}
                slotProps={{
                  textField: {
                    error: !!errors.goalDetails?.dueDate,
                    helperText: errors.goalDetails?.dueDate?.message,
                    fullWidth: true,
                  },
                  inputAdornment: {
                    position: 'start',
                  },
                }}
                {...rest}
              />
            )}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Status"
            fullWidth
            defaultValue="High"
            select
            error={!!errors.goalDetails?.status}
            helperText={errors.goalDetails?.status?.message}
            {...register('goalDetails.status')}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Delayed">Delayed</MenuItem>
            <MenuItem value="Hold">Hold</MenuItem>
            <MenuItem value="At Risk">At Risk</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            label="Priority"
            fullWidth
            defaultValue="High"
            select
            error={!!errors.goalDetails?.priority}
            helperText={errors.goalDetails?.priority?.message}
            {...register('goalDetails.priority')}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default GoalDetailsForm;
