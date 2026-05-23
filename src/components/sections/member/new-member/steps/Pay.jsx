'use client';
import { useFormContext } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import useNumberFormat from 'hooks/useNumberFormat';
import * as yup from 'yup';
import NumberTextField from 'components/base/NumberTextField';

export const payFormSchema = yup.object({
  payType: yup.string().required('Pay type is required'),
  paySchedule: yup.string().required('Pay schedule is required'),
  salaryRate: yup.number().required('Salary rate is required'),
});
const Pay = () => {
  const { currencyFormat } = useNumberFormat();
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <Grid container rowSpacing={2} columnSpacing={1}>
      <Grid size={6}>
        <TextField
          select
          fullWidth
          label="Pay type"
          defaultValue=""
          error={!!errors.payType}
          helperText={errors.payType?.message}
          {...register('payType')}
        >
          <MenuItem value="" disabled>
            Select
          </MenuItem>
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
        </TextField>
      </Grid>
      <Grid size={6}>
        <TextField
          select
          fullWidth
          label="Pay Schedule"
          defaultValue=""
          error={!!errors.paySchedule}
          helperText={errors.paySchedule?.message}
          {...register('paySchedule')}
        >
          <MenuItem value="" disabled>
            Select
          </MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </TextField>
      </Grid>
      <Grid size={6}>
        <NumberTextField
          fullWidth
          label="Salary Rate"
          placeholder="$0.00"
          error={!!errors.salaryRate}
          helperText={errors.salaryRate?.message}
          {...register(`salaryRate`, {
            setValueAs: (value) => currencyFormat(value),
          })}
        />
      </Grid>
    </Grid>
  );
};
export default Pay;
