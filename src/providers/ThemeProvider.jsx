'use client';

import { useEffect, useLayoutEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { REFRESH } from 'reducers/SettingsReducer';
import { createTheme } from 'theme/theme';
import PageLoader from 'components/loading/PageLoader';
import { useSettingsContext } from './SettingsProvider';

const RTLMode = dynamic(() => import('theme/RTLMode'), {
  ssr: false,
  loading: () => <PageLoader sx={{ height: '100vh' }} />,
});

const ThemeProvider = ({ children }) => {
  const {
    config: { textDirection, locale, themePreset, primaryColor, fontFamily, fontSize },
    configDispatch,
  } = useSettingsContext();

  const customTheme = useMemo(() => {
    return createTheme({
      direction: textDirection,
      locale,
      preset: themePreset,
      primaryColor,
      fontFamily,
      fontSize,
    });
  }, [textDirection, locale, themePreset, primaryColor, fontFamily, fontSize]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (themePreset) {
      root.setAttribute('data-agrm-preset', themePreset);
    } else {
      root.removeAttribute('data-agrm-preset');
    }
  }, [themePreset]);

  useEffect(() => {
    const observer = new MutationObserver(() => configDispatch({ type: REFRESH }));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-agrm-color-scheme'],
    });
    return () => observer.disconnect();
  }, [configDispatch]);

  return (
    <MuiThemeProvider
      disableTransitionOnChange
      theme={customTheme}
      defaultMode="light"
      modeStorageKey="agrm-mode"
    >
      <CssBaseline enableColorScheme />
      <RTLMode>{children}</RTLMode>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
