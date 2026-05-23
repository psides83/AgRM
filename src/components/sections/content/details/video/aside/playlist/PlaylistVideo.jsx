import { Box, Card, CardContent, CardMedia, Chip, Link, Stack, Typography } from '@mui/material';
import paths from 'routes/paths';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const PlaylistVideo = ({ item }) => {
  return (
    <Card
      component={Link}
      href={paths.videoDetails(`${item.id}`)}
      sx={{
        p: 0.5,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        backgroundImage: 'none',
        outline: 0,
        borderRadius: 2,
        bgcolor: 'background.elevation1',
        '&:hover': {
          bgcolor: 'background.elevation2',
        },
      }}
    >
      <Box sx={{ position: 'relative', minWidth: 112, height: 72 }}>
        <CardMedia
          component="img"
          image={item.thumbnail}
          sx={{
            height: 1,
            width: 1,
            borderRadius: 2,
          }}
        />
        <Chip
          color="neutral"
          variant="filled"
          size="small"
          label={item.duration}
          sx={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.7 }}
        />
      </Box>
      <CardContent sx={{ p: '4px !important', flexGrow: 1 }}>
        <Stack direction="column" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', lineClamp: 2 }}>
            {item.title}
          </Typography>

          <Stack justifyContent="space-between" gap={1} alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
              SN: {item.id}
            </Typography>
            <BookmarkButton size="small" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlaylistVideo;
