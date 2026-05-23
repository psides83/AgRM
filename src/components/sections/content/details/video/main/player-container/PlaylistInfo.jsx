import { Box, Button, Stack, Typography } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';

const PlaylistInfo = ({ togglePlaylist, isPlaylistShown }) => {
  const { up } = useBreakpoints();
  const upMd = up('md');

  const handleClick = () => {
    if (upMd) {
      togglePlaylist();
    } else {
      const section = document.querySelector('#video-playlist');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <Box sx={{ p: 1, mb: { xs: 3, md: 5 }, bgcolor: 'background.elevation1', borderRadius: 2 }}>
      <Stack
        flexDirection={{ xs: 'column', sm: 'row' }}
        sx={{
          gap: 2,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight={500} variant="subtitle1" sx={{ lineHeight: 1.3 }}>
          <Box component="strong" mr={1}>
            Playing from
          </Box>
          “Modern Architecture Unveiled: Innovations Shaping the Future”
        </Typography>

        <Button
          variant="soft"
          color="neutral"
          onClick={handleClick}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0, gap: 0.5 }}
        >
          <IconifyIcon icon="material-symbols:playlist-play-rounded" sx={{ fontSize: 18 }} />
          {upMd && isPlaylistShown ? 'Hide' : 'Show'} playlist
        </Button>
      </Stack>
    </Box>
  );
};

export default PlaylistInfo;
