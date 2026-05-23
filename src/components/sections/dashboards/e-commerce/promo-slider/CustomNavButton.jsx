'use client';

import IconButton from '@mui/material/IconButton';
import { useThemeMode } from 'hooks/useThemeMode';
import { cssVarRgba, hexToRgbChannel } from 'lib/utils';
import { getBlueThemePrimaryPalette, isBlueTheme } from './utils';

export const CustomNavButton = ({ children, onClick, sx }) => {
  const { themePreset } = useThemeMode();

  const isPurple = themePreset === 'luxury';
  const isBlue = isBlueTheme(themePreset);

  return (
    <IconButton
      onClick={onClick}
      sx={(theme) => {
        let color, colorChannel;
        if (isPurple) {
          color = theme.vars.palette.secondary.main;
          colorChannel = theme.vars.palette.secondary.mainChannel;
        } else if (isBlue) {
          const primaryPalette = getBlueThemePrimaryPalette(themePreset);
          if (primaryPalette) {
            color = primaryPalette[400];
            colorChannel = hexToRgbChannel(color);
          } else {
            color = theme.vars.palette.primary.main;
            colorChannel = theme.vars.palette.primary.mainChannel;
          }
        } else {
          color = theme.vars.palette.success.main;
          colorChannel = theme.vars.palette.success.mainChannel;
        }

        return {
          color,
          backgroundColor: cssVarRgba(colorChannel, 0.15),
          width: 30,
          height: 30,
          '&:hover': {
            backgroundColor: cssVarRgba(colorChannel, 0.25),
          },
          ...sx,
        };
      }}
    >
      {children}
    </IconButton>
  );
};
