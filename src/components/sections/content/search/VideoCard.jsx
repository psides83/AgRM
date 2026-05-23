import { useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSettingsContext } from 'providers/SettingsProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from '../common/BookmarkButton';

const VideoCard = ({ item, sxProps }) => {
  const {
    config: { assetsDir },
  } = useSettingsContext();
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Card
      component={Link}
      href={paths.videoDetails(`${item.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        display: 'flex',
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        p: 1,
        borderRadius: 4,
        backgroundImage: 'none',
        outline: 0,
        '&:hover': {
          bgcolor: 'background.elevation1',
          '.video-controls': { opacity: 0.7 },
        },
        '.video-controls': { opacity: 0 },
        ...sxProps,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          position: 'relative',
          aspectRatio: '16 / 9',
          height: 1,
          width: { xs: 1, sm: '35%', md: 284 },
          minWidth: { xs: 1, sm: 270, md: 284 },
          zIndex: 3,
        }}
      >
        <Box
          component="img"
          src={item.thumbnail}
          sx={{
            width: { xs: 1, md: item.isPlaylist ? 274 : 1 },
            height: { xs: item.isPlaylist ? 150 : 1, md: item.isPlaylist ? 154 : 1 },
            objectFit: 'cover',
            borderRadius: 4,
            mt: item.isPlaylist ? '10px' : 0,
            ml: { md: item.isPlaylist ? '10px' : 0 },
            opacity: isHovered ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
          alt="content thumbnail"
        />

        <Box
          component="video"
          ref={videoRef}
          src={`${assetsDir}/videos/file-manager/aurora.mp4`}
          muted
          loop
          sx={{
            position: 'absolute',
            top: item.isPlaylist ? '10px' : 0,
            left: { xs: 0, md: item.isPlaylist ? '10px' : 0 },
            width: { xs: 1, md: item.isPlaylist ? 274 : 1 },
            height: { xs: item.isPlaylist ? 150 : 1, md: item.isPlaylist ? 154 : 1 },
            objectFit: 'cover',
            borderRadius: 4,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        <Button
          className="video-controls"
          variant="contained"
          color="neutral"
          size="small"
          sx={{ position: 'absolute', top: 16, right: 16, width: 30, minWidth: 0, p: '6px' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconifyIcon icon="material-symbols:volume-off-outline-rounded" sx={{ fontSize: 18 }} />
        </Button>

        <Chip
          color="neutral"
          variant="filled"
          size="small"
          label={item.requiredTime}
          sx={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.7 }}
        />

        {item.isPlaylist &&
          [
            {
              top: 5,
              left: 5,
              width: 'calc(100% - 10px)',
              height: 153,
              bgcolor: 'chGrey.400',
              zIndex: -1,
            },
            {
              top: 0,
              left: { xs: 10, md: 0 },
              width: 'calc(100% - 20px)',
              height: 148,
              bgcolor: 'chGrey.200',
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

      <CardContent sx={{ flexGrow: 1, px: { xs: 0, md: 2 }, py: '4px !important' }}>
        <Typography variant="h6" sx={{ lineClamp: 2, mb: 0.5 }}>
          {item.title}
        </Typography>
        <Stack spacing={2} alignItems="center" mb={{ xs: 2, md: 3 }}>
          <Chip label={item.category} size="small" />
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            {dayjs(item.date).format('DD MMM,YYYY')}
          </Typography>
        </Stack>
        <Grid container spacing={{ xs: 1, md: 2 }} alignItems="center">
          <Grid size={7}>
            <Stack spacing={{ xs: 1, md: 2 }} alignItems="center">
              <Avatar src={item.uploadedBy.avatar} alt="avatar" sx={{ width: 32, height: 32 }} />
              <Typography
                variant="subtitle2"
                fontWeight="medium"
                color="text.secondary"
                sx={{ lineClamp: 1 }}
              >
                {item.uploadedBy.name}
              </Typography>
            </Stack>
          </Grid>
          <Grid size="auto" sx={{ ml: 'auto' }}>
            <Stack spacing={2} alignItems="center">
              <BookmarkButton />
              <Box
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DashboardMenu sx={{ minWidth: 36, minHeight: 36 }} />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
