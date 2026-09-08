import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import ContactFormSection from 'components/sections/crm/add-contact/ContactFormSection';
import {
  formatPhone,
  registerPhoneInput,
} from 'components/sections/crm/shared/phoneFormat';

export const personalInfoSchema = yup.object({
  personalInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    title: yup.string().optional(),
    accountNumber: yup.string().optional(),
    sameAccountNumberAsCompany: yup.boolean().default(false),
    email: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .email('Invalid email format')
      .optional(),
    sameEmailAsCompany: yup.boolean().default(false),
    phone: yup.string().optional(),
    samePhoneAsCompany: yup.boolean().default(false),
    mobilePhone: yup.string().optional(),
    sameAddressAsCompany: yup.boolean().default(false),
    addressLine1: yup.string().optional(),
    addressLine2: yup.string().optional(),
    city: yup.string().optional(),
    county: yup.string().optional(),
    region: yup.string().optional(),
    postalCode: yup.string().optional(),
    country: yup.string().default('US'),
    sameCoordinatesAsCompany: yup.boolean().default(false),
    latitude: yup
      .number()
      .typeError('Latitude must be a number')
      .min(-90)
      .max(90)
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value,
      ),
    longitude: yup
      .number()
      .typeError('Longitude must be a number')
      .min(-180)
      .max(180)
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value,
      ),
    tags: yup.array().of(yup.string()).default([]),
    notes: yup.string().optional(),
  }),
});

const tagSuggestions = [
  'Customer',
  'Prospect',
  'Farm',
  'Contractor',
  'High Priority',
  'Trade-in',
];

const PersonalInfoForm = ({ label }) => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const companyInfo = watch('companyInfo');
  const sameAccountNumberAsCompany = watch(
    'personalInfo.sameAccountNumberAsCompany',
  );
  const sameEmailAsCompany = watch('personalInfo.sameEmailAsCompany');
  const samePhoneAsCompany = watch('personalInfo.samePhoneAsCompany');
  const sameAddressAsCompany = watch('personalInfo.sameAddressAsCompany');
  const sameCoordinatesAsCompany = watch(
    'personalInfo.sameCoordinatesAsCompany',
  );

  useEffect(() => {
    if (sameAccountNumberAsCompany) {
      setValue('personalInfo.accountNumber', companyInfo?.accountNumber || '', {
        shouldDirty: true,
      });
    }
  }, [companyInfo?.accountNumber, sameAccountNumberAsCompany, setValue]);

  useEffect(() => {
    if (sameEmailAsCompany) {
      setValue('personalInfo.email', companyInfo?.email || '', {
        shouldDirty: true,
      });
    }
  }, [companyInfo?.email, sameEmailAsCompany, setValue]);

  useEffect(() => {
    if (samePhoneAsCompany) {
      setValue('personalInfo.phone', formatPhone(companyInfo?.phone) || '', {
        shouldDirty: true,
      });
    }
  }, [companyInfo?.phone, samePhoneAsCompany, setValue]);

  useEffect(() => {
    if (sameAddressAsCompany) {
      copyFields(setValue, 'personalInfo', companyInfo, addressFields);
    }
  }, [
    companyInfo?.addressLine1,
    companyInfo?.addressLine2,
    companyInfo?.city,
    companyInfo?.county,
    companyInfo?.region,
    companyInfo?.postalCode,
    companyInfo?.country,
    sameAddressAsCompany,
    setValue,
  ]);

  useEffect(() => {
    if (sameCoordinatesAsCompany) {
      copyFields(setValue, 'personalInfo', companyInfo, coordinateFields);
    }
  }, [
    companyInfo?.latitude,
    companyInfo?.longitude,
    sameCoordinatesAsCompany,
    setValue,
  ]);

  return (
    <div>
      <Box sx={{ mb: 4.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {label}
        </Typography>
        <Divider />
      </Box>
      <Stack direction="column" spacing={4}>
        <ContactFormSection title="Contact Details">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                error={!!errors.personalInfo?.firstName}
                helperText={errors.personalInfo?.firstName?.message}
                {...register('personalInfo.firstName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                error={!!errors.personalInfo?.lastName}
                helperText={errors.personalInfo?.lastName?.message}
                {...register('personalInfo.lastName')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Title / Role"
                error={!!errors.personalInfo?.title}
                helperText={errors.personalInfo?.title?.message}
                {...register('personalInfo.title')}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('personalInfo.sameAccountNumberAsCompany')}
                  />
                }
                label="Use company account number"
              />
              <TextField
                fullWidth
                label="Account Number"
                error={!!errors.personalInfo?.accountNumber}
                helperText={errors.personalInfo?.accountNumber?.message}
                {...register('personalInfo.accountNumber')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox {...register('personalInfo.sameEmailAsCompany')} />
                }
                label="Use company email"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox {...register('personalInfo.samePhoneAsCompany')} />
                }
                label="Use company phone"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                error={!!errors.personalInfo?.email}
                helperText={errors.personalInfo?.email?.message}
                {...register('personalInfo.email')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                error={!!errors.personalInfo?.phone}
                helperText={errors.personalInfo?.phone?.message}
                {...registerPhoneInput(register, 'personalInfo.phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mobile Phone"
                error={!!errors.personalInfo?.mobilePhone}
                helperText={errors.personalInfo?.mobilePhone?.message}
                {...registerPhoneInput(register, 'personalInfo.mobilePhone')}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Address">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('personalInfo.sameAddressAsCompany')}
                  />
                }
                label="Use company address"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                {...register('personalInfo.addressLine1')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                {...register('personalInfo.addressLine2')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                {...register('personalInfo.city')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="County"
                {...register('personalInfo.county')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="State / Region"
                {...register('personalInfo.region')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Postal Code"
                {...register('personalInfo.postalCode')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Country"
                {...register('personalInfo.country')}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register('personalInfo.sameCoordinatesAsCompany')}
                  />
                }
                label="Use company coordinates"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                error={!!errors.personalInfo?.latitude}
                helperText={errors.personalInfo?.latitude?.message}
                {...register('personalInfo.latitude')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                error={!!errors.personalInfo?.longitude}
                helperText={errors.personalInfo?.longitude?.message}
                {...register('personalInfo.longitude')}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Notes & Tags">
          <Controller
            name="personalInfo.tags"
            control={control}
            render={({ field }) => (
              <Autocomplete
                fullWidth
                multiple
                freeSolo
                options={tagSuggestions}
                value={field.value || []}
                onChange={(_, value) => field.onChange(value)}
                renderInput={(params) => <TextField {...params} label="Tags" />}
              />
            )}
          />
          <TextField
            fullWidth
            label="Contact Notes"
            multiline
            rows={3}
            {...register('personalInfo.notes')}
          />
        </ContactFormSection>
      </Stack>
    </div>
  );
};

const addressFields = [
  'addressLine1',
  'addressLine2',
  'city',
  'county',
  'region',
  'postalCode',
  'country',
];
const coordinateFields = ['latitude', 'longitude'];

function copyFields(setValue, targetPrefix, source, fields) {
  fields.forEach((field) => {
    setValue(`${targetPrefix}.${field}`, source?.[field] ?? '', {
      shouldDirty: true,
    });
  });
}

export default PersonalInfoForm;
