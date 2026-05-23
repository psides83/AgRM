'use client';

import { useState } from 'react';
import { Box, Collapse, Container, Paper } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { AudioProvider, useAudio } from 'components/sections/content/details/podcast/AudioProvider';
import PodcastMain from 'components/sections/content/details/podcast/main';
import PodcastPlayer from 'components/sections/content/details/podcast/player';
import ExpandedPlayer from 'components/sections/content/details/podcast/player/expanded';

const PodcastContentLayout = () => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const { isPlaying, togglePlay, restart } = useAudio();
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPlayingEpisodeNumber, setCurrentPlayingEpisodeNumber] = useState(null);

  const upSm = up('sm');

  const togglePlayer = () => setIsPlayerExpanded((prev) => !prev);

  const handleEpisodePlay = (episodeNumber) => {
    const isSameEpisode = currentPlayingEpisodeNumber === episodeNumber;
    setCurrentPlayingEpisodeNumber(episodeNumber);
    if (!isPlayerOpen) setIsPlayerOpen(true);
    if (isSameEpisode) {
      togglePlay();
    } else {
      restart();
    }
  };

  return (
    <Paper sx={{ position: 'relative' }}>
      <Collapse in={!isPlayerExpanded}>
        <Container maxWidth="md" sx={{ p: { xs: 3, md: 5 } }}>
          <PodcastMain
            onEpisodePlay={handleEpisodePlay}
            currentPlayingEpisodeNumber={currentPlayingEpisodeNumber}
            isPlaying={isPlaying}
          />
        </Container>
      </Collapse>

      <Collapse in={isPlayerExpanded}>
        <Paper background={2}>
          <Container
            maxWidth="lg"
            sx={{
              p: { xs: 3, md: 5 },
              minHeight: ({ mixins }) =>
                mixins.contentHeight(
                  topbarHeight,
                  (upSm ? mixins.footer.sm : mixins.footer.xs) + 1,
                ),
            }}
          >
            <ExpandedPlayer />
          </Container>
        </Paper>
      </Collapse>

      {isPlayerOpen && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            height: 0,
            overflow: 'visible',
            zIndex: (theme) => theme.zIndex.appBar - 1,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              animation: 'slideUp 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              '@keyframes slideUp': {
                '0%': {
                  transform: 'translateY(100%)',
                },
                '100%': {
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <PodcastPlayer isExpanded={isPlayerExpanded} togglePlayer={togglePlayer} />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

const PodcastContent = () => {
  const {
    config: { assetsDir },
  } = useSettingsContext();

  const audio = `${assetsDir}/audio/triangle-instrumental.mp3`;

  return (
    <AudioProvider audioSrc={audio}>
      <PodcastContentLayout />
    </AudioProvider>
  );
};

export default PodcastContent;
