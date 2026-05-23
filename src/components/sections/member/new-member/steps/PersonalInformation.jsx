'use client';
import { Controller, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
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
import AvatarDropBox from 'components/base/AvatarDropBox';

export const personalInformationSchema = yup.object({
  avatar: yup.mixed(),
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  displayName: yup.string().required('Display Name is required'),
  idNo: yup.string().required('ID No is required'),
  birthday: yup.date().required('Birth date is required'),
  religion: yup.string().required('Religion is required'),
  gender: yup.string().oneOf(['male', 'female', 'other']).required(),
  maritalStatus: yup.string().oneOf(['single', 'married']).required(),
});
const PersonalInformation = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Stack direction="column" gap={4}>
      <Box sx={{ alignSelf: 'center' }}>
        <Controller
          control={control}
          name="avatar"
          render={({ field: { value, onChange } }) => {
            return (
              <AvatarDropBox
                defaultFile={value}
                onDrop={(acceptedFiles) => {
                  if (acceptedFiles.length > 0) {
                    onChange(acceptedFiles[0]);
                  }
                }}
                error={errors?.avatar ? 'Invalid avatar' : undefined}
              />
            );
          }}
        />
      </Box>
      <Stack direction="column" gap={3}>
        <Grid container rowSpacing={2} columnSpacing={1}>
          <Grid size={6}>
            <TextField
              fullWidth
              label="First Name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              {...register('firstName')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Last Name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              {...register('lastName')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Display Name"
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
              {...register('displayName')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="ID No"
              error={!!errors.idNo}
              helperText={errors.idNo?.message}
              {...register('idNo')}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Birthday"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(val) => field.onChange(dayjs(val?.toDate()).format('MM/DD/YYYY'))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.birthday,
                      helperText: errors.birthday?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              select
              label="Religion"
              defaultValue=""
              error={!!errors.religion}
              helperText={errors.religion?.message}
              {...register('religion')}
            >
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              <MenuItem value="Islam">Islam</MenuItem>
              <MenuItem value="Hinduism">Hinduism</MenuItem>
              <MenuItem value="Christianity">Christianity</MenuItem>
              <MenuItem value="Buddhism">Buddhism</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <FormControl>
          <FormLabel
            id="gender-radio-buttons-group-label"
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
            name="gender"
            defaultValue="male"
            render={({ field }) => (
              <RadioGroup row aria-labelledby="gender-radio-buttons-group-label" {...field}>
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="female" control={<Radio />} label="Female" />
                <FormControlLabel value="other" control={<Radio />} label="Other" />
              </RadioGroup>
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel
            id="marital-status-radio-buttons-group-label"
            sx={{
              typography: 'caption',
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            Marital Status
          </FormLabel>
          <Controller
            control={control}
            name="maritalStatus"
            defaultValue="single"
            render={({ field }) => (
              <RadioGroup row aria-labelledby="marital-status-radio-buttons-group-label" {...field}>
                <FormControlLabel value="single" control={<Radio />} label="Single" />
                <FormControlLabel value="married" control={<Radio />} label="Married" />
              </RadioGroup>
            )}
          />
        </FormControl>
      </Stack>
    </Stack>
  );
};
export default PersonalInformation;
