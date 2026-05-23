import { useRef } from 'react';
import { SwiperSlide } from 'swiper/react';
import { Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { blogRecommendations } from 'data/content/blog';
import IconifyIcon from 'components/base/IconifyIcon';
import Swiper from 'components/base/Swiper';
import RecommendedBlog from './RecommendedBlog';

const RecommendedBlogs = () => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div>
      <Divider />

      <Stack direction="column" sx={{ gap: 3, p: { xs: 3, md: 5 } }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Typography variant="h4">Recommendations</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }} sx={{ ml: { sm: 'auto' } }}>
            <Stack
              sx={{ alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
            >
              <Stack sx={{ alignItems: 'center' }}>
                <Button
                  ref={navigationPrevRef}
                  shape="square"
                  variant="soft"
                  color="neutral"
                  sx={{ mr: 1 }}
                >
                  <IconifyIcon
                    flipOnRTL
                    icon="material-symbols:chevron-left-rounded"
                    sx={{ fontSize: 20 }}
                  />
                </Button>
                <Button
                  ref={navigationNextRef}
                  shape="square"
                  variant="soft"
                  color="neutral"
                  sx={{ mr: 2 }}
                >
                  <IconifyIcon
                    flipOnRTL
                    icon="material-symbols:chevron-right-rounded"
                    sx={{ fontSize: 20 }}
                  />
                </Button>
              </Stack>
              <Button>View more</Button>
            </Stack>
          </Grid>
        </Grid>
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          loop={true}
          navigation={{
            prevEl: navigationPrevRef,
            nextEl: navigationNextRef,
          }}
          sx={{
            '& .swiper-slide': {
              width: 'auto',
              maxHeight: 'auto',
              boxSizing: 'border-box',
            },
          }}
        >
          {blogRecommendations.map((recommendation) => (
            <SwiperSlide key={recommendation.id}>
              <RecommendedBlog item={recommendation} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Stack>
    </div>
  );
};

export default RecommendedBlogs;
