import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Grow,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from '../common/BookmarkButton';

const PodcastCard = ({ item, sxProps }) => {
  const [hovered, setHovered] = useState(false);
  const isPlaylist = item.isPlaylist;

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card
      component={Link}
      href={paths.podcastDetails(`${item.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 1, sm: 2 },
        height: 1,
        p: 1,
        borderRadius: 4,
        backgroundImage: 'none',
        transition: 'background-color 0.3s',
        '&:hover': { bgcolor: 'background.elevation1' },
        outline: 0,
        ...sxProps,
      }}
    >
      {/* Thumbnail Section */}
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: { xs: 1, sm: 168 },
          height: { xs: 311, sm: 1 },
          aspectRatio: { sm: 1 },
          zIndex: 3,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: 1, sm: isPlaylist ? 158 : 1 },
            height: 1,
            aspectRatio: { sm: 1 },
            mt: isPlaylist ? '10px' : 0,
            ml: { sm: isPlaylist ? '10px' : 0 },
          }}
        >
          <CardMedia
            component="img"
            image={item.thumbnail}
            alt={item.title}
            sx={{
              width: 1,
              height: 1,
              borderRadius: 4,
              objectFit: 'cover',
              ...(isPlaylist && {
                border: 1,
                borderColor: 'background.elevation1',
              }),
            }}
          />

          <Grow in={hovered} timeout={300}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.5)',
              }}
            >
              <IconifyIcon
                icon="material-symbols:play-circle-rounded"
                sx={{ fontSize: 40, color: 'white' }}
              />
            </Box>
          </Grow>
        </Box>

        {isPlaylist &&
          [
            {
              top: 5,
              left: { xs: 0, sm: 5 },
              width: { xs: 1, sm: 153 },
              height: 153,
              bgcolor: 'text.disabled',
              zIndex: -1,
            },
            {
              top: 0,
              left: 0,
              width: { xs: 1, sm: 148 },
              height: 148,
              bgcolor: 'background.elevation3',
              zIndex: -2,
            },
          ].map((sx, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                border: 1,
                borderColor: 'background.elevation1',
                borderRadius: '17px',
                ...sx,
              }}
            />
          ))}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          px: { xs: 0.5, sm: 2 },
          py: 1,
          '&:last-child': { pb: 1 },
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <Chip label={item.category} size="small" sx={{ textTransform: 'uppercase' }} />
          </Grid>

          <Grid sx={{ ml: 'auto' }}>
            <Stack alignItems="center" gap={2}>
              <BookmarkButton />
              <Box onClick={handleMenuClick}>
                <DashboardMenu sx={{ minWidth: 36, minHeight: 36 }} />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Typography
          variant="h6"
          sx={({ breakpoints }) => ({
            lineClamp: 2,
            mb: 1,
            [breakpoints.up('md')]: {
              lineClamp: 1,
            },
          })}
        >
          {item.title}
        </Typography>

        <Stack spacing={2} mb="18px">
          {[item.episode, item.requiredTime].map((text, idx) => (
            <Typography
              key={idx}
              variant="caption"
              sx={{ fontWeight: 'medium', color: 'text.secondary' }}
            >
              {text}
            </Typography>
          ))}
        </Stack>

        <Stack direction="column" gap={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            {item.author}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dayjs(item.date).format('DD MMM, YYYY')}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PodcastCard;
