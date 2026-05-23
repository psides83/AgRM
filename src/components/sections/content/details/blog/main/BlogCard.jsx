import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from '../../../common/BookmarkButton';

const BlogCard = ({ item, sxProps }) => {
  return (
    <Card
      component={Link}
      href={paths.blogDetails(`${item.id}`)}
      sx={{
        gap: 2,
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
        p: 1,
        borderRadius: 4,
        backgroundImage: 'none',
        '&:hover': {
          bgcolor: 'background.elevation1',
        },
        outline: 0,
        ...sxProps,
      }}
    >
      <Box sx={{ width: { xs: 1, md: 300, xl: 335 }, height: { xs: 170, md: 210 }, flexShrink: 0 }}>
        <CardMedia
          component="img"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            borderRadius: 3,
          }}
          image={item.thumbnail}
          alt="blogs image"
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, px: { xs: 0, xl: 2 }, py: '14px !important' }}>
        <Stack sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 1 }}>
          {item.author && <Typography variant="subtitle2">{item.author}</Typography>}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
            {dayjs(item.date).format('DD MMM,YYYY')}
          </Typography>
        </Stack>
        <Typography variant="h6" sx={{ lineClamp: 2, mb: 0.5 }}>
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, lineClamp: 2 }}>
          {item.description}
        </Typography>
        <Grid container spacing={{ xs: 1, md: 2 }} sx={{ alignItems: 'center' }}>
          <Grid size={7}>
            <Stack sx={{ gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
              <Chip label={item.category} size="small" />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 'medium',
                  color: 'text.secondary',
                  lineClamp: 1,
                }}
              >
                {item.requiredTime}
              </Typography>
            </Stack>
          </Grid>
          <Grid size="auto" sx={{ ml: 'auto' }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
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

export default BlogCard;
