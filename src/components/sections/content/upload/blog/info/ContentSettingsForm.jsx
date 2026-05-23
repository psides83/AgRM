import { useFormContext } from 'react-hook-form';
import { Grid, Stack, Typography } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';
import Accessibility from '../../common/form-fields/Accessibility';
import Language from '../../common/form-fields/Language';
import Tags from '../../common/form-fields/Tags';
import TargetAudience from '../../common/form-fields/TargetAudience';
import Topics from '../../common/form-fields/Topics';

const ContentSettingsForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack direction="column" gap={3}>
      <Topics />

      <div>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>
          Canonical link
        </Typography>

        <StyledTextField
          {...register('canonicalLink')}
          fullWidth
          placeholder="Link"
          error={!!errors.canonicalLink}
          helperText={errors.canonicalLink?.message}
        />
      </div>

      <Tags />

      <Grid container spacing={1}>
        <Grid size={6}>
          <Accessibility />
        </Grid>

        <Grid size={6}>
          <Language />
        </Grid>
      </Grid>

      <TargetAudience />
    </Stack>
  );
};

export default ContentSettingsForm;
