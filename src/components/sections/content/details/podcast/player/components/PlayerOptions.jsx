import { useState } from 'react';
import { Box, Button, Popover, Slider, Stack, Tooltip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAudio } from '../../AudioProvider';

const PlayerOptions = ({ isExpanded, togglePlayer, sx }) => {
  const { volume, isMuted, toggleMute, changeVolume, playbackRate, changePlaybackRate } =
    useAudio();
  const [volumeAnchor, setVolumeAnchor] = useState(null);
  const [playbackAnchor, setPlaybackAnchor] = useState(null);

  const handleVolumeEnter = (event) => {
    setVolumeAnchor(event.currentTarget);
  };

  const handleVolumeLeave = () => {
    setVolumeAnchor(null);
  };

  const handlePlaybackClick = (event) => {
    setPlaybackAnchor(event.currentTarget);
  };

  const handlePlaybackClose = () => {
    setPlaybackAnchor(null);
  };

  const volumeOpen = Boolean(volumeAnchor);
  const playbackOpen = Boolean(playbackAnchor);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <Stack
      sx={{
        alignItems: 'center',
        gap: 1,
        justifyContent: 'flex-end',
        width: { xl: 320 },
        ...sx,
      }}
    >
      <Button
        shape="circle"
        color="neutral"
        size="small"
        onMouseEnter={handleVolumeEnter}
        onMouseLeave={handleVolumeLeave}
      >
        <IconifyIcon
          icon={
            isMuted || volume === 0
              ? 'material-symbols:volume-off-outline-rounded'
              : volume < 0.5
                ? 'material-symbols:volume-down-outline-rounded'
                : 'material-symbols:volume-up-outline-rounded'
          }
          sx={{ fontSize: 18 }}
        />
      </Button>

      <Popover
        open={volumeOpen}
        anchorEl={volumeAnchor}
        onClose={handleVolumeLeave}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            pointerEvents: 'auto',
          },
        }}
        slotProps={{
          paper: {
            onMouseEnter: () => setVolumeAnchor(volumeAnchor),
            onMouseLeave: handleVolumeLeave,
          },
        }}
      >
        <Box sx={{ p: 1, pt: 3, width: 60 }}>
          <Stack direction="column" spacing={2} alignItems="center">
            <Slider
              value={isMuted ? 0 : volume * 100}
              onChange={(e, value) => changeVolume(Number(value) / 100)}
              min={0}
              max={100}
              size="small"
              orientation="vertical"
              sx={{ height: 120 }}
            />
            <Button shape="circle" color="neutral" size="small" onClick={toggleMute}>
              <IconifyIcon
                icon={
                  isMuted || volume === 0
                    ? 'material-symbols:volume-off-outline-rounded'
                    : volume < 0.5
                      ? 'material-symbols:volume-down-outline-rounded'
                      : 'material-symbols:volume-up-outline-rounded'
                }
                sx={{ fontSize: 18 }}
              />
            </Button>
          </Stack>
        </Box>
      </Popover>

      <Tooltip title="Playback Speed" placement="top" arrow>
        <Button shape="circle" color="neutral" size="small" onClick={handlePlaybackClick}>
          <IconifyIcon icon="material-symbols:speed-outline-rounded" sx={{ fontSize: 18 }} />
        </Button>
      </Tooltip>

      <Popover
        open={playbackOpen}
        anchorEl={playbackAnchor}
        onClose={handlePlaybackClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: { p: 1, maxHeight: 200 },
          },
        }}
      >
        <Stack direction="column">
          {playbackRates.map((rate) => (
            <Button
              key={rate}
              variant={playbackRate === rate ? 'contained' : 'text'}
              color={playbackRate === rate ? 'primary' : 'neutral'}
              size="small"
              fullWidth
              onClick={() => {
                changePlaybackRate(rate);
                handlePlaybackClose();
              }}
            >
              {rate}x
            </Button>
          ))}
        </Stack>
      </Popover>

      <Tooltip title={isExpanded ? 'Collapse player' : 'Expand player'} placement="top" arrow>
        <Button shape="square" color="neutral" size="small" onClick={togglePlayer}>
          <IconifyIcon
            icon={
              isExpanded
                ? 'material-symbols:collapse-content-rounded'
                : 'material-symbols:expand-content-rounded'
            }
            sx={{ fontSize: 18 }}
          />
        </Button>
      </Tooltip>
    </Stack>
  );
};

export default PlayerOptions;
