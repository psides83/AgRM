import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import Image from 'components/base/Image';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const RecommendedBlog = ({ item, sxProps }) => {
  return (
    <Stack
      component={Link}
      href={paths.blogDetails(`${item.id}`)}
      underline="none"
      color="inherit"
      sx={{
        flexDirection: 'column',
        p: 0.5,
        width: 272,
        height: 1,
        borderRadius: 4,
        backgroundImage: 'none',
        '&:hover': {
          bgcolor: 'background.elevation1',
        },
        outline: 0,
        ...sxProps,
      }}
    >
      <Box sx={{ position: 'relative', width: 1, aspectRatio: '16/9', mb: 2 }}>
        <Image
          sx={{
            objectFit: 'cover',
            borderRadius: 4,
          }}
          fill
          src={item.thumbnail}
          alt="blogs image"
        />
      </Box>

      <Box sx={{ flexGrow: 1, px: 1, py: 2 }}>
        <Stack sx={{ justifyContent: 'space-between', gap: 1, alignItems: 'center', mb: 2 }}>
          {item.author && (
            <Typography variant="subtitle2" sx={{ lineClamp: 1 }}>
              {item.author}
            </Typography>
          )}
          <Typography
            variant="caption"
            fontWeight={500}
            sx={{ color: 'text.secondary', lineClamp: 1 }}
          >
            {dayjs(item.date).format('DD MMM,YYYY')}
          </Typography>
        </Stack>

        <Typography variant="subtitle1" fontWeight={700} sx={{ lineClamp: 2, mb: 1 }}>
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', lineClamp: 2 }}>
          {item.description}
        </Typography>

        <Stack sx={{ gap: 1, alignItems: 'center' }}>
          <Chip label={item.category} size="small" />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: 'text.secondary',
              lineClamp: 1,
              flex: 1,
            }}
          >
            {item.requiredTime}
          </Typography>
          <BookmarkButton />
        </Stack>
      </Box>
    </Stack>
  );
};

export default RecommendedBlog;
