'use client';

import Lottie from 'lottie-react';
import { Suspense } from 'react';
import { Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import authDark from 'assets/json/auth-dark.json';
import auth from 'assets/json/auth.json';
import { useThemeMode } from 'hooks/useThemeMode';
import Logo from 'components/common/Logo';
import DefaultLoader from 'components/loading/DefaultLoader';

const DefaultAuthLayout = ({ children }) => {
  const { isDark } = useThemeMode();

  return (
    <Grid
      container
      sx={{
        height: { md: '100vh' },
        minHeight: '100vh',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      <Grid
        sx={{
          borderRight: { md: 1 },
          borderColor: { md: 'divider' },
        }}
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Stack
          direction="column"
          sx={{
            justifyContent: 'space-between',
            height: 1,
            p: { xs: 3, sm: 5 },
          }}
        >
          <Stack
            sx={{
              justifyContent: { xs: 'center', md: 'flex-start' },
              mb: { xs: 5, md: 0 },
            }}
          >
            <Logo />
          </Stack>

          <Stack
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              display: { xs: 'none', md: 'flex', flexDirection: 'row-reverse' },
              transform: (theme) => (theme.direction === 'rtl' ? 'scaleX(-1)' : 'unset'),
            }}
          >
            {isDark ? <Lottie animationData={authDark} /> : <Lottie animationData={auth} />}
          </Stack>
          <div />
        </Stack>
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
        sx={{
          display: { xs: 'flex', md: 'block' },
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Suspense fallback={<DefaultLoader />}>{children}</Suspense>
      </Grid>
    </Grid>
  );
};

export default DefaultAuthLayout;
