import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete, Box, Divider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import ContactFormSection from 'components/sections/crm/add-contact/ContactFormSection';

export const personalInfoSchema = yup.object({
  personalInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    title: yup.string().optional(),
    email: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .email('Invalid email format')
      .optional(),
    phone: yup.string().optional(),
    mobilePhone: yup.string().optional(),
    addressLine1: yup.string().optional(),
    addressLine2: yup.string().optional(),
    city: yup.string().optional(),
    region: yup.string().optional(),
    postalCode: yup.string().optional(),
    country: yup.string().default('US'),
    tags: yup.array().of(yup.string()).default([]),
    notes: yup.string().optional(),
  }),
});

const tagSuggestions = ['Customer', 'Prospect', 'Farm', 'Contractor', 'High Priority', 'Trade-in'];

const PersonalInfoForm = ({ label }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

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
                {...register('personalInfo.phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Mobile Phone"
                error={!!errors.personalInfo?.mobilePhone}
                helperText={errors.personalInfo?.mobilePhone?.message}
                {...register('personalInfo.mobilePhone')}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Address">
          <Grid container spacing={2} sx={{ width: 1 }}>
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
              <TextField fullWidth label="City" {...register('personalInfo.city')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="State / Region" {...register('personalInfo.region')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Postal Code" {...register('personalInfo.postalCode')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Country" {...register('personalInfo.country')} />
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

export default PersonalInfoForm;
