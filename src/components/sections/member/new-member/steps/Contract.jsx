'use client';
import { Controller, useFormContext } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import * as yup from 'yup';
import PhoneInput from 'components/common/PhoneInput';

export const addressSchema = yup.object({
  email: yup.string().email().required('Email is required'),
  phone: yup.string().required('Phone No is required'),
});
const Contract = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Grid container rowSpacing={2} columnSpacing={1}>
      <Grid size={6}>
        <TextField
          fullWidth
          label="Email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />
      </Grid>
      <Grid size={6}>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => <PhoneInput fullWidth label="Phone No" {...field} />}
        />
      </Grid>
    </Grid>
  );
};
export default Contract;
