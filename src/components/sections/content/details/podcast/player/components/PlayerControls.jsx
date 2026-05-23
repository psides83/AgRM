import { Button, Stack, Tooltip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAudio } from '../../AudioProvider';

const PlayerControls = () => {
  const {
    isPlaying,
    isRepeating,
    isShuffling,
    togglePlay,
    skipBackward,
    skipForward,
    toggleRepeat,
    toggleShuffle,
  } = useAudio();

  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: { xs: 1, md: 2 } }}>
      <Tooltip title={isShuffling ? 'Shuffle On' : 'Shuffle Off'} placement="top" arrow>
        <Button
          shape="circle"
          color="neutral"
          size="small"
          onClick={toggleShuffle}
          sx={{ opacity: isShuffling ? 1 : 0.6 }}
        >
          <IconifyIcon icon="material-symbols:shuffle-rounded" sx={{ fontSize: 18 }} />
        </Button>
      </Tooltip>

      <Tooltip title="Skip Backward 30s" placement="top" arrow>
        <Button shape="circle" color="neutral" size="small" onClick={() => skipBackward(30)}>
          <IconifyIcon icon="material-symbols:replay-30-rounded" sx={{ fontSize: 18 }} />
        </Button>
      </Tooltip>

      <Tooltip title={isPlaying ? 'Pause' : 'Play'} placement="top" arrow>
        <Button
          size="medium"
          shape="circle"
          variant="contained"
          color="primary"
          onClick={togglePlay}
        >
          <IconifyIcon
            icon={
              isPlaying ? 'material-symbols:pause-rounded' : 'material-symbols:play-arrow-rounded'
            }
            sx={{ fontSize: 30 }}
          />
        </Button>
      </Tooltip>

      <Tooltip title="Skip Forward 30s" placement="top" arrow>
        <Button shape="circle" color="neutral" size="small" onClick={() => skipForward(30)}>
          <IconifyIcon icon="material-symbols:forward-30-rounded" sx={{ fontSize: 18 }} />
        </Button>
      </Tooltip>

      <Tooltip title={isRepeating ? 'Repeat One' : 'Repeat Off'} placement="top" arrow>
        <Button
          onClick={toggleRepeat}
          shape="circle"
          color="neutral"
          size="small"
          sx={{ opacity: isRepeating ? 1 : 0.6 }}
        >
          <IconifyIcon
            icon={
              isRepeating
                ? 'material-symbols:repeat-one-rounded'
                : 'material-symbols:repeat-rounded'
            }
            sx={{ fontSize: 18 }}
          />
        </Button>
      </Tooltip>
    </Stack>
  );
};

export default PlayerControls;
