import { Controller, useFormContext } from 'react-hook-form';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

const ControlledRatingCard = ({
  title,
  fieldName,
  paperProps,
  typographyProps,
  ratingProps,
  sx,
}) => {
  const { control } = useFormContext();

  return (
    <Paper
      background={1}
      sx={{
        px: 2,
        py: 1,
        outline: 0,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx,
      }}
      {...paperProps}
    >
      <Typography variant="body2" {...typographyProps}>
        {title}
      </Typography>

      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <Rating
            {...field}
            value={field.value ?? 0}
            onChange={(_, val) => field.onChange(val)}
            size="small"
            {...ratingProps}
          />
        )}
      />
    </Paper>
  );
};

export default ControlledRatingCard;
