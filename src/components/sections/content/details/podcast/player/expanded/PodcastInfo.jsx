import { Box, Typography } from '@mui/material';
import { podcastPlaylist } from 'data/content/podcast';
import Image from 'components/base/Image';

const episode = podcastPlaylist[0].episodeLists[1];

const PodcastInfo = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row', md: 'column' },
        gap: 3,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 1,
          aspectRatio: '1/1',
          overflow: 'hidden',
          borderRadius: 3,
        }}
      >
        <Image
          src={episode.imageSrc}
          alt="Podcast image"
          fill
          sx={{ objectFit: 'cover', objectPosition: 'bottom' }}
        />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 'medium', mb: 1, color: 'text.secondary' }}>
          Episode {episode.episodeNumber}
        </Typography>
        <Typography variant="h5">{episode.title}</Typography>
      </Box>
    </Box>
  );
};

export default PodcastInfo;
