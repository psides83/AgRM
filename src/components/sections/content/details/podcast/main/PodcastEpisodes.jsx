import { useState } from 'react';
import { Box, Button, Grow, Stack, Typography } from '@mui/material';
import { podcastPlaylist } from 'data/content/podcast';
import useNumberFormat from 'hooks/useNumberFormat';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const formatEpisodeDuration = (time) => {
  const parts = time.split(':').map(Number);
  const totalMinutes = parts.length === 3 ? parts[0] * 60 + parts[1] : parts[0];
  return totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)} hr`;
};

const podcast = podcastPlaylist[0];

const PodcastEpisodes = ({ onEpisodePlay, currentPlayingEpisodeNumber, isPlaying }) => {
  const {
    config: { assetsDir },
  } = useSettingsContext();
  const { numberFormat } = useNumberFormat();
  const { up } = useBreakpoints();
  const [currentLength, setCurrentLength] = useState(7);
  const [hoveredEpisode, setHoveredEpisode] = useState(null);

  const upSm = up('sm');

  const handleShowEpisodes = () => {
    setCurrentLength(currentLength === 7 ? podcast.episodeLists.length : 7);
  };

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Episodes (
        {numberFormat(podcast.totalEpisodes, { notation: 'compact', compactDisplay: 'short' })})
      </Typography>

      <Stack direction="column" gap={1} sx={{ mb: 2 }}>
        {podcast.episodeLists.slice(0, currentLength).map((item) => (
          <Stack
            key={item.episodeNumber}
            title={item.title}
            onClick={() => onEpisodePlay(item.episodeNumber)}
            sx={{
              width: 1,
              color: 'inherit',
              display: 'flex',
              p: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'background.elevation1',
              },
            }}
            onMouseEnter={() => setHoveredEpisode(item.episodeNumber)}
            onMouseLeave={() => setHoveredEpisode(null)}
          >
            <Box
              sx={{
                flexShrink: 0,
                position: 'relative',
                height: 80,
                width: 80,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Image
                src={
                  item.imageSrc
                    ? item.imageSrc
                    : `${assetsDir}/images/sections/blogs/podcast/24.webp`
                }
                alt="podcast image"
                fill
                sx={{ objectFit: 'cover' }}
              />

              <Grow
                in={
                  hoveredEpisode === item.episodeNumber ||
                  currentPlayingEpisodeNumber === item.episodeNumber
                }
                timeout={300}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                  }}
                >
                  <IconifyIcon
                    icon={
                      currentPlayingEpisodeNumber === item.episodeNumber && isPlaying
                        ? 'material-symbols:pause-circle-rounded'
                        : 'material-symbols:play-circle-rounded'
                    }
                    sx={{ fontSize: 32, color: 'white' }}
                  />
                </Box>
              </Grow>
            </Box>

            <Stack
              sx={{
                flex: 1,
                gap: 2,
                alignItems: 'center',
                py: { xs: 1, sm: 2 },
                px: 2,
              }}
            >
              <Stack direction="column" justifyContent="space-between" height={1}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ lineClamp: upSm ? 1 : 2, wordBreak: 'break-all' }}
                >
                  {item.title}
                </Typography>

                <Stack sx={{ gap: 2, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                    Ep {item.episodeNumber}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                    {formatEpisodeDuration(item.duration)}
                  </Typography>
                </Stack>
              </Stack>

              <BookmarkButton size="small" sx={{ ml: 'auto' }} />
            </Stack>
          </Stack>
        ))}
      </Stack>

      {podcast.episodeLists.length > 6 && (
        <Stack sx={{ justifyContent: 'flex-end' }}>
          <Button
            size="small"
            onClick={handleShowEpisodes}
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            Load {currentLength === 7 ? 'More' : 'Less'}
          </Button>
        </Stack>
      )}
    </div>
  );
};

export default PodcastEpisodes;
