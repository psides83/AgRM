'use client';

import { memo, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { lightPalettes } from 'theme/palettes';
import { createTheme } from 'theme/theme';

const themeCache = new Map();

const getThemeCacheKey = (preset, cssVarPrefix) => {
  return `${preset}-${cssVarPrefix}`;
};

const getTheme = (preset, cssVarPrefix) => {
  const cacheKey = getThemeCacheKey(preset, cssVarPrefix);
  const cached = themeCache.get(cacheKey);
  if (cached) return cached;

  const theme = createTheme({ preset, cssVarPrefix });
  themeCache.set(cacheKey, theme);
  return theme;
};

const NestedThemeProvider = memo(
  ({ children, preset }) => {
    const mode = useMemo(() => (preset in lightPalettes ? 'light' : 'dark'), [preset]);

    const cssVarPrefix = useMemo(() => `agrm-${preset}`, [preset]);

    const theme = useMemo(() => getTheme(preset, cssVarPrefix), [preset, cssVarPrefix]);

    return (
      <div data-agrm-color-scheme={mode}>
        <MuiThemeProvider theme={theme} disableTransitionOnChange>
          {children}
        </MuiThemeProvider>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.preset === nextProps.preset,
);

NestedThemeProvider.displayName = 'NestedThemeProvider';

export default NestedThemeProvider;
