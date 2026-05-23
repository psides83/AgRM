'use client';

import { SwiperSlide } from 'swiper/react';
import { Box, Paper, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { promoSliderData } from 'data/e-commerce/dashboard';
import { useThemeMode } from 'hooks/useThemeMode';
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules';
import Swiper from 'components/base/Swiper';
import { CardWrapper } from './CardWrapper';
import { SwiperNavigation } from './SwiperNavigation';
import { AiTools } from './illustrations/Ai-tools';
import { Rocket } from './illustrations/Rocket';
import { Support } from './illustrations/Support';
import { getBlueThemePrimaryPalette, isBlueTheme } from './utils';

const PromoSlider = () => {
  const { themePreset, isDark } = useThemeMode();

  const isBlue = isBlueTheme(themePreset);

  let hardcodedPrimaryDark = null;
  let hardcodedPrimaryMain = null;
  if (isBlue) {
    const primaryPalette = getBlueThemePrimaryPalette(themePreset);
    if (primaryPalette) {
      hardcodedPrimaryDark = primaryPalette[300];
      hardcodedPrimaryMain = primaryPalette[400];
    }
  }

  const illustrationMap = {
    rocket: (props) => <Rocket {...props} />,
    aiTools: (props) => <AiTools {...props} />,
    customer: (props) => <Support {...props} />,
  };

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 5 },
        height: 1,
      }}
    >
      <CardWrapper>
        <Swiper
          modules={[Navigation, Pagination, A11y, Autoplay]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          // autoplay={{
          //   pauseOnMouseEnter: true,
          // }}
          autoplay={false}
          loop={true}
          sx={{
            width: 1,
            height: 1,
            '& .swiper': { height: 1 },
            '& .swiper-wrapper': { height: 1 },
          }}
        >
          <SwiperNavigation />
          {promoSliderData.map((slide) => {
            const IllustrationComponent = illustrationMap[slide.imageKey];

            return (
              <SwiperSlide
                key={slide.title}
                style={{
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    height: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Stack
                    direction="column"
                    justifyContent="space-between"
                    sx={{ height: 1, gridColumn: { xs: '1/-1', sm: '1/3' } }}
                  >
                    <div></div>
                    <Stack
                      direction="column"
                      sx={{
                        gap: 2,
                        width: 1,
                        pt: 6,
                        pb: 5,
                        maxWidth: { xs: 'none', lg: 280 },
                      }}
                    >
                      <Typography
                        variant="h5"
                        lineHeight={1.2}
                        sx={{
                          typography: { xs: 'h4', md: 'h5', lg: 'h4' },
                          color:
                            themePreset === 'luxury'
                              ? 'secondary.dark'
                              : hardcodedPrimaryDark || 'success.dark',
                        }}
                      >
                        {slide.title}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color:
                            themePreset === 'luxury'
                              ? 'secondary.main'
                              : hardcodedPrimaryMain || 'success.main',
                          maxWidth: 320,
                        }}
                      >
                        {slide.subtitle}
                      </Typography>
                    </Stack>

                    <Button
                      href={slide.buttonLink}
                      variant="contained"
                      sx={{ alignSelf: 'flex-start', position: 'relative', zIndex: 2 }}
                    >
                      {slide.buttonText}
                    </Button>
                  </Stack>

                  <Stack
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      gridColumn: '3/4',
                      pt: 5,
                      display: { xs: 'none', sm: 'flex' },
                      width: 1,
                      maxHeight: 180,
                    }}
                  >
                    <IllustrationComponent themePreset={themePreset} isDark={isDark} />
                  </Stack>
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </CardWrapper>
    </Paper>
  );
};

export default PromoSlider;
