'use client';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import * as yup from 'yup';

export const jobInformationSchema = yup.object({
  designation: yup.string().required('Designation is required'),
  joiningDate: yup.date().required('Joining date is required'),
  department: yup.string().required('Department is required'),
  team: yup.string().required('Team is required'),
  branch: yup.string().required('Branch is required'),
  shift: yup.string().required('Shift is required'),
  supervisor: yup.string().required('Supervisor is required'),
  employmentStatus: yup.string().required('Status is required'),
  employmentType: yup
    .string()
    .oneOf(['in-office', 'hybrid', 'remote'])
    .required('Type is required'),
});
const JobInformation = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack direction="column" gap={3}>
      <Grid container rowSpacing={2} columnSpacing={1}>
        <Grid size={6}>
          <TextField
            fullWidth
            label="Designation"
            error={!!errors.designation}
            helperText={errors.designation?.message}
            {...register('designation')}
          />
        </Grid>
        <Grid size={6}>
          <Controller
            name="joiningDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Joining Date"
                value={field.value ? dayjs(field.value) : null}
                onChange={(val) => field.onChange(dayjs(val?.toDate()).format('MM/DD/YYYY'))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.joiningDate,
                    helperText: errors.joiningDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            select
            fullWidth
            label="Department"
            error={!!errors.department}
            defaultValue=""
            helperText={errors.department?.message}
            {...register('department')}
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            <MenuItem value="Design">Design</MenuItem>
            <MenuItem value="Engineering">Engineering</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Support">Support</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            select
            fullWidth
            label="Team"
            error={!!errors.team}
            defaultValue=""
            helperText={errors.team?.message}
            {...register('team')}
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            <MenuItem value="Themewagon">Themewagon</MenuItem>
            <MenuItem value="Mailbluster">Mailbluster</MenuItem>
            <MenuItem value="Blackbox">Blackbox</MenuItem>
            <MenuItem value="Hyperninja">Hyperninja</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            select
            fullWidth
            label="Branch"
            error={!!errors.branch}
            defaultValue=""
            helperText={errors.branch?.message}
            {...register('branch')}
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            <MenuItem value="Sylhet">Sylhet</MenuItem>
            <MenuItem value="Dhaka">Dhaka</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            select
            fullWidth
            label="Shift"
            defaultValue=""
            error={!!errors.shift}
            helperText={errors.shift?.message}
            {...register('shift')}
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            <MenuItem value="Day">Day</MenuItem>
            <MenuItem value="Night">Night</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            label="Supervisor"
            error={!!errors.supervisor}
            helperText={errors.supervisor?.message}
            {...register('supervisor')}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            select
            fullWidth
            label="Employment Status"
            defaultValue=""
            error={!!errors.employmentStatus}
            helperText={errors.employmentStatus?.message}
            {...register('employmentStatus')}
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Resigned">Resigned</MenuItem>
            <MenuItem value="Intern">Intern</MenuItem>
            <MenuItem value="Contract">Contract</MenuItem>
            <MenuItem value="Probation">Probation</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <FormControl>
        <FormLabel
          id="employement-type-radio-buttons-group-label"
          sx={{
            typography: 'caption',
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          Gender
        </FormLabel>
        <Controller
          control={control}
          name="employmentType"
          defaultValue="in-office"
          render={({ field }) => (
            <RadioGroup row aria-labelledby="employement-type-radio-buttons-group-label" {...field}>
              <FormControlLabel value="in-office" control={<Radio />} label="In Office" />
              <FormControlLabel value="hybrid" control={<Radio />} label="Hybrid" />
              <FormControlLabel value="remote" control={<Radio />} label="Remote" />
            </RadioGroup>
          )}
        />
      </FormControl>
    </Stack>
  );
};
export default JobInformation;
