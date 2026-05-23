import { useFormContext } from 'react-hook-form';
import { Stack, Typography, inputBaseClasses } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';
import Thumbnail from '../../common/form-fields/Thumbnail';

const PrimaryContentForm = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const title = watch('title') || '';
  const subText = watch('subText') || '';

  return (
    <Stack direction="column" gap={2}>
      <div>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Title
        </Typography>
        <StyledTextField
          {...register('title')}
          fullWidth
          placeholder="Title"
          error={!!errors.title}
          helperText={errors.title?.message}
          slotProps={{
            htmlInput: {
              maxLength: 75,
            },
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="right"
          mt={0.5}
          mr={1.5}
        >
          {title.length}/75
        </Typography>
      </div>

      <div>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Sub-text
        </Typography>

        <StyledTextField
          {...register('subText')}
          fullWidth
          multiline
          rows={3}
          placeholder="Write the sub-text"
          error={!!errors.subText}
          helperText={errors.subText?.message}
          slotProps={{
            htmlInput: {
              maxLength: 140,
            },
          }}
          sx={{ [`.${inputBaseClasses.root}`]: { p: 0 } }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="right"
          mt={0.5}
          mr={1.5}
        >
          {subText.length}/140
        </Typography>
      </div>

      <Thumbnail />
    </Stack>
  );
};

export default PrimaryContentForm;
