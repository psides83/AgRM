import { useState } from 'react';
import { Box, Chip, Grow, Link, Stack, Typography } from '@mui/material';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const RecommendedPodcast = ({ item, sxProps }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Stack
      component={Link}
      href={paths.podcastDetails(`${item.id}`)}
      underline="none"
      color="inherit"
      sx={{
        flexDirection: 'column',
        borderRadius: 4,
        backgroundImage: 'none',
        '&:hover': {
          bgcolor: 'background.elevation1',
        },
        width: 222,
        ...sxProps,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        sx={{
          flexShrink: 0,
          position: 'relative',
          width: 1,
          zIndex: 3,
          pt: '10px',

          '&::after': {
            content: '""',
            position: 'absolute',
            top: '5px',
            left: '5px',
            width: 'calc(100% - 10px)',
            height: 'calc(100% - 10px)',
            bgcolor: 'chGrey.400',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 4,
            zIndex: -1,
          },

          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0px',
            left: '10px',
            width: 'calc(100% - 20px)',
            height: 'calc(100% - 20px)',
            bgcolor: 'chGrey.200',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 4,
            zIndex: -2,
          },
        }}
      >
        <Box sx={{ position: 'relative', width: 1, aspectRatio: 1 }}>
          <Image
            sx={{
              objectFit: 'cover',
              borderRadius: 4,
            }}
            fill
            src={item.image}
            alt="blogs image"
          />

          <Grow in={isHovered} timeout={300}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                width: 1,
                height: 1,
                zIndex: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
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

      <Stack direction="column" alignItems="flex-start" gap={1} sx={{ p: 2 }}>
        <Chip label={item.category} size="small" sx={{ textTransform: 'capitalize', mb: 1 }} />

        <Typography
          variant="subtitle1"
          sx={{ lineClamp: 2, mb: 1, fontWeight: 700, lineBreak: 'break-all' }}
        >
          {item.title}
        </Typography>

        <Stack gap={1} alignItems="center" justifyContent="space-between" width={1}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'medium', lineClamp: 1, wordBreak: 'break-all' }}
          >
            {item.author.name}
          </Typography>

          <BookmarkButton />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default RecommendedPodcast;
