import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const RelatedVideo = ({ item }) => {
  return (
    <Card
      component={Link}
      href={paths.videoDetails(`${item.id}`)}
      sx={{
        p: 0.5,
        display: 'flex',
        width: { xs: 1, lg: 327 },
        gap: 1,
        alignItems: 'center',
        backgroundImage: 'none',
        borderRadius: 2,
        outline: 0,
        '&:hover': {
          bgcolor: 'background.elevation1',
          '.MuiBox-root .MuiButton-root': {
            opacity: 0.7,
          },
        },
        '.MuiBox-root .MuiButton-root': {
          opacity: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', minWidth: 131, height: 78 }}>
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
        <Button
          variant="contained"
          color="neutral"
          size="small"
          shape="square"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 30,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconifyIcon icon="material-symbols:volume-off-outline-rounded" sx={{ fontSize: 18 }} />
        </Button>
      </Box>
      <CardContent sx={{ p: '4px !important', flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold', lineClamp: 2 }}>
          {item.title}
        </Typography>
        <Stack sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Chip size="small" label={item.category} />
          <BookmarkButton size="small" />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RelatedVideo;
