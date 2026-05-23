import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { moreFromCreator } from 'data/content/blog';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from '../../../common/BookmarkButton';

const BlogsFromCreator = () => {
  return (
    <div>
      <Typography variant="h6" sx={{ mb: 4 }}>
        More from Creator
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {moreFromCreator.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 12 }}>
            <Card
              component={Link}
              href={paths.blogDetails(`${item.id}`)}
              sx={{
                gap: 2,
                display: 'flex',
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
              }}
            >
              <Box
                sx={{
                  width: { xs: 1, md: 300, xl: 335 },
                  aspectRatio: '16 / 10',
                  flexShrink: 0,
                }}
              >
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
                <Stack
                  sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 1 }}
                >
                  {item.author && <Typography variant="subtitle2">{item.author}</Typography>}
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                  >
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
          </Grid>
        ))}
      </Grid>

      <Stack sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" sx={{ alignItems: 'center' }}>
          View more
          <IconifyIcon
            flipOnRTL
            icon="material-symbols:chevron-right-rounded"
            sx={{ fontSize: 18, ml: 0.5 }}
          />
        </Button>
      </Stack>
    </div>
  );
};

export default BlogsFromCreator;
