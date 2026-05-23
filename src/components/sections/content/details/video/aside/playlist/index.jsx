import { useState } from 'react';
import { Box, ButtonBase, Collapse, IconButton, Paper, Stack, Typography } from '@mui/material';
import { videos } from 'data/content/video';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import PlaylistVideo from './PlaylistVideo';

const playlistItems = videos.filter((item) => item.type === 'playlist');

const VideoPlaylist = ({ togglePlaylist }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { up } = useBreakpoints();

  const upMd = up('md');

  const Component = upMd ? Stack : ButtonBase;

  const toggleCollapse = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Paper
      variant="elevation"
      id="video-playlist"
      elevation={0}
      sx={{
        py: 2,
        flexShrink: 0,
        bgcolor: 'background.elevation1',
        borderRadius: 4,
        height: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        component={Component}
        onClick={toggleCollapse}
        {...(!upMd ? { disableRipple: true } : {})}
        sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', px: 2 }}
      >
        <Typography variant="h6">
          Playlist
          <Typography component="span" variant="body1" fontWeight={600} sx={{ ml: 1 }}>
            (120 videos)
          </Typography>
        </Typography>

        {upMd ? (
          <IconButton onClick={togglePlaylist}>
            <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
          </IconButton>
        ) : (
          <IconifyIcon
            icon="material-symbols:keyboard-arrow-down-rounded"
            sx={{ fontSize: 20, rotate: isExpanded ? '180deg' : '0deg' }}
          />
        )}
      </Stack>

      {upMd ? (
        <Box sx={{ flex: 1, pt: 2, overflow: 'hidden' }}>
          <SimpleBar>
            <Stack direction="column" sx={{ gap: 1, px: 2 }}>
              {playlistItems.map((item) => (
                <PlaylistVideo key={item.id} item={item} />
              ))}
            </Stack>
          </SimpleBar>
        </Box>
      ) : (
        <Collapse in={isExpanded} unmountOnExit>
          <Box sx={{ flex: 1, pt: 2, overflow: 'hidden' }}>
            <SimpleBar sx={{ maxHeight: 600 }}>
              <Stack direction="column" sx={{ gap: 1, px: 2 }}>
                {playlistItems.map((item) => (
                  <PlaylistVideo key={item.id} item={item} />
                ))}
              </Stack>
            </SimpleBar>
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

export default VideoPlaylist;
