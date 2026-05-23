import { useFormContext } from 'react-hook-form';
import { Box, Divider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import ContactFormSection from 'components/sections/crm/add-contact/ContactFormSection';

export const companyInfoSchema = yup.object({
  companyInfo: yup.object({
    name: yup.string().optional(),
    companyType: yup.string().optional(),
    website: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .url('Invalid website URL')
      .optional(),
    phone: yup.string().optional(),
    email: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .email('Invalid email format')
      .optional(),
    addressLine1: yup.string().optional(),
    addressLine2: yup.string().optional(),
    city: yup.string().optional(),
    region: yup.string().optional(),
    postalCode: yup.string().optional(),
    country: yup.string().default('US'),
    notes: yup.string().optional(),
  }),
});

const CompanyInfoForm = ({ label }) => {
  const {
    register,
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
        <ContactFormSection title="Company Details">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Company / Farm Name"
                error={!!errors.companyInfo?.name}
                helperText={errors.companyInfo?.name?.message}
                {...register('companyInfo.name')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Company Type"
                placeholder="Farm, contractor, municipality..."
                {...register('companyInfo.companyType')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Website" {...register('companyInfo.website')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Company Phone" {...register('companyInfo.phone')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                error={!!errors.companyInfo?.email}
                helperText={errors.companyInfo?.email?.message}
                {...register('companyInfo.email')}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Company Address">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                {...register('companyInfo.addressLine1')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                {...register('companyInfo.addressLine2')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="City" {...register('companyInfo.city')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="State / Region" {...register('companyInfo.region')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Postal Code" {...register('companyInfo.postalCode')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Country" {...register('companyInfo.country')} />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Company Notes">
          <TextField
            fullWidth
            label="Company Notes"
            multiline
            rows={3}
            {...register('companyInfo.notes')}
          />
        </ContactFormSection>
      </Stack>
    </div>
  );
};

export default CompanyInfoForm;
