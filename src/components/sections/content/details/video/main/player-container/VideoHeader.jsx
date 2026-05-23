import { Chip, Stack, Typography } from '@mui/material';

const VideoHeader = () => {
  return (
    <div>
      <Typography variant="h4" sx={{ lineClamp: 2, mb: 1 }}>
        Exploring Modern Architecture: Innovative Designs Shaping Our World Today
      </Typography>

      <Stack sx={{ gap: 1, alignItems: 'center', mb: 3 }}>
        <Chip size="small" label="Architecture" />
        <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
          1 Aug,2024
        </Typography>
      </Stack>
    </div>
  );
};

export default VideoHeader;
