'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useThemeMode } from 'hooks/useThemeMode';
import { cssVarRgba, generatePaletteChannel } from 'lib/utils';
import { getBlueThemePrimaryPalette, isBlueTheme } from './utils';

export const CardWrapper = ({ children, sx }) => {
  const { themePreset, isDark } = useThemeMode();

  const hardcodedChBlue = useMemo(() => {
    const primaryPalette = getBlueThemePrimaryPalette(themePreset);
    if (!primaryPalette) return null;

    return generatePaletteChannel({
      50: primaryPalette[950],
      100: primaryPalette[800],
      200: primaryPalette[700],
      300: primaryPalette[600],
      400: primaryPalette[500],
      500: primaryPalette[400],
      600: primaryPalette[300],
      700: primaryPalette[200],
      800: primaryPalette[100],
      900: primaryPalette[50],
      950: '#ffffff',
    });
  }, [themePreset]);

  const isBlue = isBlueTheme(themePreset);

  return (
    <Box
      sx={(theme) => {
        let paletteKey = 'chGreen';
        if (themePreset === 'luxury') {
          paletteKey = 'chPurple';
        } else if (isBlue) {
          paletteKey = 'chBlue';
        }

        const palette =
          isBlue && hardcodedChBlue ? hardcodedChBlue : theme.vars.palette[paletteKey];
        const bg = theme.vars.palette.background;

        return {
          background: `
            radial-gradient(
              120.77% 120.77% at 62.42% 14.25%,
              ${cssVarRgba(palette['50Channel'], 0)} 51.22%,
              ${cssVarRgba(palette['100Channel'], 0.48)} 69.8%
            ),
            linear-gradient(
              247deg,
              ${cssVarRgba(palette['100Channel'], isDark ? 0.24 : 0.08)} -50.55%,
              ${cssVarRgba(bg.elevation1Channel, isDark ? 0.24 : 0.08)} 98.13%
            ),
            radial-gradient(
              125.2% 221.14% at 103.41% -3.28%,
              ${cssVarRgba(bg.elevation1Channel, 1)} 52.92%,
              ${cssVarRgba(palette['50Channel'], 0.48)} 67.23%,
              ${cssVarRgba(palette['100Channel'], 0.48)} 100%
            ),
            linear-gradient(
              309.91deg,
              ${cssVarRgba(palette['100Channel'], 0.02)} 0.61%,
              ${cssVarRgba(palette['200Channel'], 0.02)} 39.75%
            )
          `,
          borderRadius: theme.spacing(3),
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: { xs: 3, lg: 5 },
          ...sx,

          // SWIPER -----------------------------------------------------
          '& .swiper-pagination': {
            top: theme.spacing(1.5),
            left: 0,
            width: 'auto',
            display: 'flex',
            zIndex: 1,
            pointerEvents: 'none',
          },
          '& .swiper-pagination-bullet': {
            backgroundColor: `${palette['100']} !important`,
            borderRadius: `${theme.spacing(1.5)} !important`,
            width: theme.spacing(2),
            height: theme.spacing(0.5),
            margin: theme.spacing(0, 0.5),
            transition: 'all 0.3s ease',
            pointerEvents: 'auto',
            cursor: 'pointer',
          },
          '& .swiper-pagination-bullet-active': {
            backgroundColor: `${palette['400']} !important`,
            width: `${theme.spacing(4)} !important`,
          },
        };
      }}
    >
      {children}
    </Box>
  );
};
