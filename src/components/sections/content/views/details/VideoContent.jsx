'use client';

import { Container, Paper } from '@mui/material';
import VideoDetails from 'components/sections/content/details/video';

const VideoContent = () => {
  return (
    <Paper sx={{ height: 1 }}>
      <Container maxWidth="lg" disableGutters sx={{ p: { xs: 3, md: 5 } }}>
        <VideoDetails />
      </Container>
    </Paper>
  );
};

export default VideoContent;
