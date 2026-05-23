import { useState } from 'react';
import { Box, Button, Chip, Grid, Grow, Link, Stack, Typography } from '@mui/material';
import { podcastPlaylist } from 'data/content/podcast';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const PodcastsFromCreator = () => {
  const [hoveredPodcast, setHoveredPodcast] = useState(null);

  return (
    <Stack direction="column" sx={{ mb: { xs: 3, md: 5 } }}>
      <Typography variant="h6" sx={{ mb: 4 }}>
        More from Creator
      </Typography>

      <Grid container spacing={2}>
        {podcastPlaylist.slice(1, 11).map((item) => (
          <Grid size={{ xs: 12, md: 6 }} key={item.id}>
            <Stack
              component={Link}
              href={paths.podcastDetails(`${item.id}`)}
              underline="none"
              title={item.title}
              sx={{
                alignItems: 'center',
                color: 'inherit',
                p: 0.5,
                backgroundImage: 'none',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'background.elevation1',
                },
              }}
              onMouseEnter={() => setHoveredPodcast(item.id)}
              onMouseLeave={() => setHoveredPodcast(null)}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  position: 'relative',
                  height: 112,
                  width: 112,

                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: 98,
                    height: 98,
                    bgcolor: 'chGrey.200',
                    borderWidth: 1,
                    borderColor: 'background.elevation1',
                    borderRadius: 3,
                    zIndex: 1,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    width: 102,
                    height: 102,
                    bgcolor: 'chGrey.400',
                    borderWidth: 1,
                    borderColor: 'background.elevation1',
                    borderRadius: 3,
                    zIndex: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 3,
                    mt: '6px',
                    ml: '6px',
                    width: 105,
                    height: 105,
                  }}
                >
                  <Image
                    sx={{
                      objectFit: 'cover',
                      borderRadius: 3,
                    }}
                    fill
                    src={item.image}
                    alt="blogs image"
                  />

                  <Grow in={hoveredPodcast === item.id} timeout={300}>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 3,
                      }}
                    >
                      <IconifyIcon
                        icon="material-symbols:play-circle-rounded"
                        sx={{ fontSize: 32, color: 'white' }}
                      />
                    </Box>
                  </Grow>
                </Box>
              </Box>

              <Stack
                direction="column"
                sx={{
                  flex: 1,
                  height: 1,
                  justifyContent: 'space-between',
                  pl: 1,
                  pr: 0.5,
                  py: 2.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ lineClamp: 2, mb: 1, fontWeight: 'bold', wordBreak: 'break-all' }}
                >
                  {item.title}
                </Typography>

                <Stack sx={{ gap: 2, alignItems: 'center' }}>
                  <Chip label={item.category} size="small" sx={{ textTransform: 'capitalize' }} />
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      flex: 1,
                      color: 'text.secondary',
                    }}
                  >
                    {item.totalEpisodes} eps
                  </Typography>
                  <BookmarkButton size="small" />
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>

      {podcastPlaylist.length > 11 && (
        <Stack sx={{ justifyContent: 'flex-end', mt: 2 }}>
          <Button
            size="small"
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            Load more
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default PodcastsFromCreator;
