import { useRef, useState } from 'react';
import { Box, Divider, Drawer, Stack } from '@mui/material';
import { videos } from 'data/content/video';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import ContentComments from '../common/comments';
import VideoPlaylist from './aside/playlist';
import RelatedVideos from './aside/related-videos';
import VideoDescription from './main/description';
import ChannelInfo from './main/player-container/ChannelInfo';
import PlaylistInfo from './main/player-container/PlaylistInfo';
import VideoActions from './main/player-container/VideoActions';
import VideoHeader from './main/player-container/VideoHeader';
import VideoPlayer from './main/player-container/VideoPlayer';

const drawerWidth = { xs: 1, md: 280, lg: 328 };

const VideoDetails = () => {
  const { up } = useBreakpoints();
  const [showPlaylist, setShowPlaylist] = useState(true);
  const containerRef = useRef(null);

  const upMd = up('md');

  const togglePlaylist = () => setShowPlaylist((prev) => !prev);

  return (
    <Stack direction="column" gap={{ xs: 3, md: 5 }}>
      <Stack
        ref={containerRef}
        direction={{ xs: 'column', md: 'row' }}
        alignItems="stretch"
        gap={{ xs: 3, md: 2, lg: 3 }}
        sx={{ position: 'relative', width: '100%' }}
      >
        <Box
          sx={{
            flexGrow: 1,
            flexBasis: showPlaylist ? `calc(100% - ${drawerWidth}px)` : '100%',
            transition: 'flex-basis 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PlaylistInfo togglePlaylist={togglePlaylist} isPlaylistShown={showPlaylist} />
          <VideoHeader />
          <VideoPlayer />
          <ChannelInfo />
          <VideoActions />
        </Box>

        {upMd ? (
          <Drawer
            variant="persistent"
            anchor="right"
            open={showPlaylist}
            onClose={togglePlaylist}
            ModalProps={{
              container: containerRef.current,
              disablePortal: true,
              keepMounted: true,
            }}
            sx={{
              flexShrink: 0,
              width: showPlaylist ? drawerWidth : 0,
              transition: 'width 0.3s ease',
              display: 'flex',
              flexDirection: 'column',

              '& .MuiDrawer-paper': {
                position: 'relative',
                flexBasis: 0,
                flexGrow: 1,
                zIndex: (theme) => theme.zIndex.appBar - 1,
                width: drawerWidth,
                height: 1,
                border: 'none',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <VideoPlaylist togglePlaylist={togglePlaylist} />
          </Drawer>
        ) : (
          <VideoPlaylist />
        )}
      </Stack>

      <Stack gap={{ xs: 2, lg: 3 }} direction={{ xs: 'column', md: 'row' }}>
        <div>
          <VideoDescription description={videos[0].details} />
          <Divider sx={{ mb: { xs: 3, md: 5 } }} />
          <ContentComments />
        </div>

        <RelatedVideos />
      </Stack>
    </Stack>
  );
};

export default VideoDetails;
