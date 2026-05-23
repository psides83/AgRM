import { Controller, useFormContext } from 'react-hook-form';
import { Box, Divider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import * as yup from 'yup';
import ContactFormSection from 'components/sections/crm/add-contact/ContactFormSection';
import ControlledSelect from 'components/sections/crm/add-contact/ControlledSelect';

export const leadInfoSchema = yup.object({
  leadInfo: yup.object({
    source: yup.string().optional(),
    status: yup
      .string()
      .transform((value) => (value === '' ? undefined : value))
      .oneOf(['new', 'working', 'qualified', 'unqualified', 'converted'])
      .optional(),
    priority: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .min(1)
      .max(5)
      .optional(),
    estimatedBudget: yup
      .number()
      .typeError('Estimated budget must be a number')
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value)),
    targetPurchaseDate: yup.string().nullable().optional(),
    lastContactedAt: yup.string().nullable().optional(),
    nextFollowUpAt: yup.string().nullable().optional(),
    notes: yup.string().optional(),
  }),
});

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'working', label: 'Working' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
];

const priorityOptions = [
  { value: 1, label: '1 - Highest' },
  { value: 2, label: '2 - High' },
  { value: 3, label: '3 - Normal' },
  { value: 4, label: '4 - Low' },
  { value: 5, label: '5 - Lowest' },
];

const LeadInfoForm = ({ label }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <Box sx={{ mb: 4.5 }}>
        <Typography variant="h6" sx={{ mb: 2, whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
        <Divider />
      </Box>

      <Stack direction="column" spacing={4}>
        <ContactFormSection title="Lead Details">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Lead Source"
                placeholder="Referral, walk-in, phone, website..."
                {...register('leadInfo.source')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledSelect
                name="leadInfo.status"
                label="Lead Status"
                options={statusOptions}
                control={control}
                error={errors.leadInfo?.status?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ControlledSelect
                name="leadInfo.priority"
                label="Priority"
                options={priorityOptions}
                control={control}
                error={errors.leadInfo?.priority?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Budget"
                error={!!errors.leadInfo?.estimatedBudget}
                helperText={errors.leadInfo?.estimatedBudget?.message}
                {...register('leadInfo.estimatedBudget')}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Timing">
          <Grid container spacing={2} sx={{ width: 1 }}>
            <Grid size={12}>
              <Controller
                control={control}
                name="leadInfo.targetPurchaseDate"
                render={({ field }) => (
                  <DatePicker
                    label="Target Purchase Date"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                control={control}
                name="leadInfo.lastContactedAt"
                render={({ field }) => (
                  <DateTimePicker
                    label="Last Contacted"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString() : null)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                control={control}
                name="leadInfo.nextFollowUpAt"
                render={({ field }) => (
                  <DateTimePicker
                    label="Next Follow-up"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toISOString() : null)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </ContactFormSection>

        <ContactFormSection title="Lead Notes">
          <TextField fullWidth label="Lead Notes" multiline rows={3} {...register('leadInfo.notes')} />
        </ContactFormSection>
      </Stack>
    </div>
  );
};

export default LeadInfoForm;
