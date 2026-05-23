import { Slider, Stack, Typography, sliderClasses } from '@mui/material';
import { useAudio } from '../../AudioProvider';

const PlayerProgress = () => {
  const { currentTime, duration, seek, formatTime } = useAudio();

  const handleChange = (_event, value) => {
    seek(Number(value));
  };

  return (
    <Stack sx={{ alignItems: 'center', width: '100%' }}>
      <Typography variant="caption" sx={{ minWidth: 56 }}>
        {formatTime(currentTime)}
      </Typography>

      <Slider
        value={currentTime}
        min={0}
        max={duration || 0}
        step={0.1}
        onChange={handleChange}
        sx={{
          flexGrow: 1,
          width: '100%',
          [`.${sliderClasses.track}`]: {
            border: 'none',
          },
        }}
      />

      <Typography variant="caption" sx={{ minWidth: 56, textAlign: 'right' }}>
        {formatTime(duration)}
      </Typography>
    </Stack>
  );
};

export default PlayerProgress;
