import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, FormHelperText, Radio, RadioGroup, Typography } from '@mui/material';

const TargetAudience = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Target Audience
      </Typography>

      <Controller
        name="targetAudience"
        control={control}
        defaultValue="all"
        render={({ field }) => (
          <RadioGroup {...field}>
            <FormControlLabel value="all" control={<Radio />} label="Suitable for all audiences" />
            <FormControlLabel
              value="children"
              control={<Radio />}
              label="Specifically designed for children"
            />
            <FormControlLabel
              value="adults"
              control={<Radio />}
              label="Contains content intended for adults"
            />
          </RadioGroup>
        )}
      />

      {errors.targetAudience && (
        <FormHelperText error>{errors.targetAudience.message}</FormHelperText>
      )}
    </div>
  );
};

export default TargetAudience;
