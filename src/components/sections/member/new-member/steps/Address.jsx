'use client';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { countries } from 'data/countries';
import * as yup from 'yup';
import CountrySelect from 'components/common/CountrySelect';

export const addressSchema = yup.object({
  permanent: yup.object({
    country: yup.string().required('Country is required'),
    state: yup.string().required('State is required'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Street is required'),
    zip: yup.string().required('Zip code is required'),
  }),
  present: yup.object({
    country: yup.string().required('Country is required'),
    state: yup.string().required('State is required'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Street is required'),
    zip: yup.string().required('Zip code is required'),
  }),
  isSameAddress: yup.boolean().required(),
});
const Address = () => {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const { isSameAddress, permanent } = watch();
  useEffect(() => {
    if (isSameAddress) {
      setValue('present', permanent, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue('present', {
        country: '',
        state: '',
        city: '',
        street: '',
        zip: '',
      });
    }
  }, [isSameAddress, permanent, setValue]);
  return (
    <Stack direction="column" gap={4}>
      <Stack direction="column" gap={1}>
        <Typography sx={{ fontWeight: 600 }}>Permanent Address</Typography>
        <Grid container rowSpacing={2} columnSpacing={1}>
          <Grid size={6}>
            <Controller
              name="permanent.country"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CountrySelect
                  sx={{ mb: 1 }}
                  fullWidth
                  onChange={(_, value) => onChange(value ? value.label : '')}
                  value={countries.find((country) => country.label === value) || null}
                  renderInput={(params) => (
                    <TextField
                      label="Country"
                      error={!!errors.permanent?.country?.message}
                      helperText={errors.permanent?.country?.message}
                      {...params}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="State"
              error={!!errors.permanent?.state}
              helperText={errors.permanent?.state?.message}
              {...register('permanent.state')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="City"
              error={!!errors.permanent?.city}
              helperText={errors.permanent?.city?.message}
              {...register('permanent.city')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Street"
              error={!!errors.permanent?.street}
              helperText={errors.permanent?.street?.message}
              {...register('permanent.street')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Zip"
              error={!!errors.permanent?.zip}
              helperText={errors.permanent?.zip?.message}
              {...register('permanent.zip')}
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack direction="column" gap={1}>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 600 }}>Present Address</Typography>
          <Controller
            name="isSameAddress"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} {...field} />}
                label="Same as permanent"
              />
            )}
          />
        </Stack>
        <Grid container rowSpacing={2} columnSpacing={1}>
          <Grid size={6}>
            <Controller
              name="present.country"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CountrySelect
                  sx={{ mb: 1 }}
                  fullWidth
                  disabled={isSameAddress}
                  onChange={(_, value) => onChange(value ? value.label : '')}
                  value={countries.find((country) => country.label === value) || null}
                  renderInput={(params) => (
                    <TextField
                      label="Country"
                      error={!!errors.present?.country?.message}
                      helperText={errors.present?.country?.message}
                      {...params}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              control={control}
              name="present.state"
              render={({ field }) => (
                <TextField
                  fullWidth
                  disabled={isSameAddress}
                  label="State"
                  error={!!errors.present?.state}
                  helperText={errors.present?.state?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              control={control}
              name="present.city"
              render={({ field }) => (
                <TextField
                  fullWidth
                  disabled={isSameAddress}
                  label="City"
                  error={!!errors.present?.city}
                  helperText={errors.present?.city?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              control={control}
              name="present.street"
              render={({ field }) => (
                <TextField
                  fullWidth
                  disabled={isSameAddress}
                  label="Street"
                  error={!!errors.present?.street}
                  helperText={errors.present?.street?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={6}>
            <Controller
              control={control}
              name="present.zip"
              render={({ field }) => (
                <TextField
                  fullWidth
                  disabled={isSameAddress}
                  label="Zip"
                  error={!!errors.present?.zip}
                  helperText={errors.present?.zip?.message}
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};
export default Address;
