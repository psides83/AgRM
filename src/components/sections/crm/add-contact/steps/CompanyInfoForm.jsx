import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
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

export const companyInfoSchema = yup.object({
  companyInfo: yup.object({
    associationMode: yup
      .string()
      .oneOf(['create', 'existing', 'none'])
      .default('create'),
    existingCompanyId: yup.string().optional(),
    name: yup.string().optional(),
    companyType: yup.string().optional(),
    accountNumber: yup.string().optional(),
    sameAccountNumberAsContact: yup.boolean().default(false),
    website: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .url('Invalid website URL')
      .optional(),
    phone: yup.string().optional(),
    samePhoneAsContact: yup.boolean().default(false),
    email: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .email('Invalid email format')
      .optional(),
    sameEmailAsContact: yup.boolean().default(false),
    sameAddressAsContact: yup.boolean().default(false),
    addressLine1: yup.string().optional(),
    addressLine2: yup.string().optional(),
    city: yup.string().optional(),
    county: yup.string().optional(),
    region: yup.string().optional(),
    postalCode: yup.string().optional(),
    country: yup.string().default('US'),
    sameCoordinatesAsContact: yup.boolean().default(false),
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
    notes: yup.string().optional(),
  }),
});

const CompanyInfoForm = ({ label, companies = [] }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const personalInfo = watch('personalInfo');
  const associationMode = watch('companyInfo.associationMode') || 'create';
  const sameAccountNumberAsContact = watch(
    'companyInfo.sameAccountNumberAsContact',
  );
  const sameEmailAsContact = watch('companyInfo.sameEmailAsContact');
  const samePhoneAsContact = watch('companyInfo.samePhoneAsContact');
  const sameAddressAsContact = watch('companyInfo.sameAddressAsContact');
  const sameCoordinatesAsContact = watch(
    'companyInfo.sameCoordinatesAsContact',
  );

  useEffect(() => {
    if (sameAccountNumberAsContact) {
      setValue('companyInfo.accountNumber', personalInfo?.accountNumber || '', {
        shouldDirty: true,
      });
    }
  }, [personalInfo?.accountNumber, sameAccountNumberAsContact, setValue]);

  useEffect(() => {
    if (sameEmailAsContact) {
      setValue('companyInfo.email', personalInfo?.email || '', {
        shouldDirty: true,
      });
    }
  }, [personalInfo?.email, sameEmailAsContact, setValue]);

  useEffect(() => {
    if (samePhoneAsContact) {
      setValue('companyInfo.phone', formatPhone(personalInfo?.phone) || '', {
        shouldDirty: true,
      });
    }
  }, [personalInfo?.phone, samePhoneAsContact, setValue]);

  useEffect(() => {
    if (sameAddressAsContact) {
      copyFields(setValue, 'companyInfo', personalInfo, addressFields);
    }
  }, [
    personalInfo?.addressLine1,
    personalInfo?.addressLine2,
    personalInfo?.city,
    personalInfo?.county,
    personalInfo?.region,
    personalInfo?.postalCode,
    personalInfo?.country,
    sameAddressAsContact,
    setValue,
  ]);

  useEffect(() => {
    if (sameCoordinatesAsContact) {
      copyFields(setValue, 'companyInfo', personalInfo, coordinateFields);
    }
  }, [
    personalInfo?.latitude,
    personalInfo?.longitude,
    sameCoordinatesAsContact,
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
        <ContactFormSection title="Company Association">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Company"
                defaultValue="create"
                {...register('companyInfo.associationMode')}
              >
                <MenuItem value="create">Create New Company</MenuItem>
                <MenuItem value="existing">Use Existing Company</MenuItem>
                <MenuItem value="none">No Company</MenuItem>
              </TextField>
            </Grid>
            {associationMode === 'existing' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Existing Company"
                  defaultValue=""
                  {...register('companyInfo.existingCompanyId')}
                >
                  <MenuItem value="">Select a company</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {companyLabel(company)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </ContactFormSection>

        {associationMode === 'create' && (
          <>
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('companyInfo.sameAccountNumberAsContact')}
                      />
                    }
                    label="Use contact account number"
                  />
                  <TextField
                    fullWidth
                    label="Account Number"
                    {...register('companyInfo.accountNumber')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Website"
                    {...register('companyInfo.website')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('companyInfo.samePhoneAsContact')}
                      />
                    }
                    label="Use contact phone"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('companyInfo.sameEmailAsContact')}
                      />
                    }
                    label="Use contact email"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Company Phone"
                    {...registerPhoneInput(register, 'companyInfo.phone')}
                  />
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('companyInfo.sameAddressAsContact')}
                      />
                    }
                    label="Use contact address"
                  />
                </Grid>
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
                  <TextField
                    fullWidth
                    label="City"
                    {...register('companyInfo.city')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="County"
                    {...register('companyInfo.county')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="State / Region"
                    {...register('companyInfo.region')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    {...register('companyInfo.postalCode')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    {...register('companyInfo.country')}
                  />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('companyInfo.sameCoordinatesAsContact')}
                      />
                    }
                    label="Use contact coordinates"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    error={!!errors.companyInfo?.latitude}
                    helperText={errors.companyInfo?.latitude?.message}
                    {...register('companyInfo.latitude')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    error={!!errors.companyInfo?.longitude}
                    helperText={errors.companyInfo?.longitude?.message}
                    {...register('companyInfo.longitude')}
                  />
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
          </>
        )}
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

function companyLabel(company) {
  return [company.name, company.city, company.region]
    .filter(Boolean)
    .join(' - ');
}

export default CompanyInfoForm;
