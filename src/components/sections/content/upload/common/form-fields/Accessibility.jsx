import { Controller, useFormContext } from 'react-hook-form';
import { Box, FormControl, FormHelperText, MenuItem, Typography } from '@mui/material';
import StyledSelect from 'components/styled/StyledSelect';

const ACCESSIBILITY_OPTIONS = ['Ev', 'Unlisted', 'Private'];

const Accessibility = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box flex={1}>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Accessibility
      </Typography>

      <FormControl fullWidth error={!!errors.accessibility}>
        <Controller
          name="accessibility"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <StyledSelect {...field} displayEmpty>
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              {ACCESSIBILITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </StyledSelect>
          )}
        />

        {errors.accessibility && <FormHelperText>{errors.accessibility.message}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default Accessibility;
