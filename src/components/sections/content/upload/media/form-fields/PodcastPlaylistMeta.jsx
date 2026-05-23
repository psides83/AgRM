import { useFormContext } from 'react-hook-form';
import { Box, FormHelperText, Grid, Typography } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';

const PodcastPlaylistMeta = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <Grid size={6}>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Episode No
          </Typography>

          <StyledTextField
            placeholder="Number"
            type="number"
            fullWidth
            error={!!errors.episodeNo}
            inputProps={{ min: 1 }}
            {...register('episodeNo', { valueAsNumber: true })}
          />
          {errors.episodeNo && (
            <FormHelperText error sx={{ mx: '14px' }}>
              {errors.episodeNo.message}
            </FormHelperText>
          )}
        </Box>
      </Grid>

      <Grid size={6}>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Season No
          </Typography>

          <StyledTextField
            placeholder="Number"
            type="number"
            fullWidth
            error={!!errors.seasonNo}
            inputProps={{ min: 1 }}
            {...register('seasonNo', { valueAsNumber: true })}
          />
          {errors.seasonNo && (
            <FormHelperText error sx={{ mx: '14px' }}>
              {errors.seasonNo.message}
            </FormHelperText>
          )}
        </Box>
      </Grid>
    </>
  );
};

export default PodcastPlaylistMeta;
