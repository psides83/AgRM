import { Controller, useFormContext } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import StyledTextField from 'components/styled/StyledTextField';

const Transcript = () => {
  const {
    formState: { errors },
    register,
    control,
  } = useFormContext();

  return (
    <div>
      <Stack gap={1} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Subtitle/Transcript
        </Typography>
        <Controller
          control={control}
          name="transcript.autoGenerate"
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch size="small" checked={field.value} {...field} />}
              label="Auto-generate"
              sx={{ gap: 1, mx: 0, flexDirection: 'row-reverse' }}
            />
          )}
        />
      </Stack>

      <StyledTextField
        fullWidth
        multiline
        rows={8}
        placeholder="Add Subtitle"
        error={!!errors.transcript?.subtitle}
        helperText={errors.transcript?.subtitle?.message}
        {...register('transcript.subtitle')}
        sx={{
          '& .MuiInputBase-root': {
            pt: 0,
          },
        }}
      />
    </div>
  );
};

export default Transcript;
