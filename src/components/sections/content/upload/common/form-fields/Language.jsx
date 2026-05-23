import { Controller, useFormContext } from 'react-hook-form';
import { Box, FormControl, FormHelperText, MenuItem, Typography } from '@mui/material';
import StyledSelect from 'components/styled/StyledSelect';

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German'];

const Language = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box flex={1}>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Language
      </Typography>

      <FormControl fullWidth error={!!errors.language}>
        <Controller
          name="language"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <StyledSelect {...field} displayEmpty>
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              {LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </StyledSelect>
          )}
        />

        {errors.language && <FormHelperText>{errors.language.message}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default Language;
