'use client';

import { CacheProvider } from '@emotion/react';
import { Suspense, lazy, useMemo } from 'react';
import createCache from '@emotion/cache';
import { CssBaseline, ThemeProvider as MuiThemeProvider, Stack } from '@mui/material';
import { prefixedLayouts, preloadAssets, webApps } from 'data/showcase';
import { useSettingsContext } from 'providers/SettingsProvider';
import RTLMode from 'theme/RTLMode';
import { createTheme } from 'theme/theme';
import PageLoader from 'components/loading/PageLoader';
import CustomizeLayout from 'components/sections/showcase/customize-layout';
import ShowcaseHero from 'components/sections/showcase/hero';
import ShowcaseLayout from 'components/sections/showcase/layout';
import { usePreloadAssets } from './common';

const ThemePresetsShowcase = lazy(() => import('components/sections/showcase/theme-presets'));
const PrefixedLayouts = lazy(() => import('components/sections/showcase/prefixed-layouts'));
const ElegantCards = lazy(() => import('components/sections/showcase/elegant-cards'));
const WebApps = lazy(() => import('components/sections/showcase/web-apps/WebApps'));
const FigmaCTA = lazy(() => import('components/sections/showcase/cta/figma/FigmaCTA'));
const ShowcaseCTA = lazy(() => import('components/sections/showcase/cta/showcase/ShowcaseCTA'));

const ltrCache = createCache({
  key: 'agrmltr',
});

const ShowcaseThemeProvider = ({ children }) => {
  const {
    config: { textDirection, locale },
  } = useSettingsContext();

  const showcaseTheme = useMemo(
    () =>
      createTheme({
        direction: textDirection,
        locale,
        preset: 'default-dark',
        cssVarPrefix: 'agrm-showcase',
      }),
    [textDirection, locale],
  );

  return (
    <MuiThemeProvider
      disableTransitionOnChange
      theme={showcaseTheme}
      modeStorageKey="agrm-mode-showcase"
    >
      <CssBaseline enableColorScheme />
      <RTLMode>{children}</RTLMode>
    </MuiThemeProvider>
  );
};

const ShowcaseWrapper = ({ children }) => (
  <CacheProvider value={ltrCache}>
    <div dir="ltr" data-agrm-color-scheme="dark">
      <ShowcaseThemeProvider>{children}</ShowcaseThemeProvider>
    </div>
  </CacheProvider>
);

const ShowcaseContent = () => (
  <ShowcaseLayout>
    <ShowcaseHero />
    <Stack direction="column" pt={14}>
      <CustomizeLayout />
      <ThemePresetsShowcase />
      <PrefixedLayouts data={prefixedLayouts} />
      <ElegantCards />
      <WebApps data={webApps} />
      <FigmaCTA />
      <ShowcaseCTA />
    </Stack>
  </ShowcaseLayout>
);

const Showcase = () => {
  usePreloadAssets(preloadAssets);

  return (
    <ShowcaseWrapper>
      <Suspense
        fallback={
          <PageLoader sx={{ minHeight: '100vh', bgcolor: ({ vars }) => vars.palette.grey[950] }} />
        }
      >
        <ShowcaseContent />
      </Suspense>
    </ShowcaseWrapper>
  );
};

export default Showcase;
