import { generatePaletteChannel } from 'lib/utils';
import {
  arcticPrimary,
  draculaPrimary,
  emberPrimary,
  luxuryPrimary,
  midnightPrimary,
  naturePrimary,
  primaryRetro,
} from './colors';
import { blue } from './colors/base';

export const COLOR_GROUPS = [
  { key: 'default-light', main: blue[500], palette: blue },
  { key: 'default-dark', main: blue[400], palette: blue },
  { key: 'retro', main: primaryRetro[500], palette: primaryRetro },
  { key: 'luxury', main: luxuryPrimary[500], palette: luxuryPrimary },
  { key: 'arctic', main: arcticPrimary[500], palette: arcticPrimary },
  { key: 'nature', main: naturePrimary[500], palette: naturePrimary },
  { key: 'ember', main: emberPrimary[400], palette: emberPrimary },
  { key: 'dracula', main: draculaPrimary[400], palette: draculaPrimary },
  { key: 'midnight', main: midnightPrimary[400], palette: midnightPrimary },
];

const createLightModeMapping = (shades, mainColor) => ({
  lighter: shades[50],
  light: shades[400],
  main: mainColor,
  dark: shades[600],
  darker: shades[900],
});

const createDarkModeMapping = (shades, mainColor) => ({
  lighter: shades[950],
  light: shades[700],
  main: mainColor,
  dark: shades[300],
  darker: shades[100],
  contrastText: shades[950],
});

const createInvertedChBlue = (shades) => ({
  50: shades[950],
  100: shades[800],
  200: shades[700],
  300: shades[600],
  400: shades[500],
  500: shades[400],
  600: shades[300],
  700: shades[200],
  800: shades[100],
  900: shades[50],
  950: '#ffffff',
});

export const applyPrimaryOverride = (basePalette, primaryColor, mode = 'light') => {
  if (!primaryColor) return basePalette;
  const colorGroup = COLOR_GROUPS.find((group) => group.main === primaryColor);
  if (!colorGroup?.palette) return basePalette;

  const newPrimary =
    mode === 'dark'
      ? generatePaletteChannel({
          ...createDarkModeMapping(colorGroup.palette, primaryColor),
        })
      : generatePaletteChannel({
          ...createLightModeMapping(colorGroup.palette, primaryColor),
        });

  const newChBlue =
    mode === 'dark'
      ? generatePaletteChannel(createInvertedChBlue(colorGroup.palette))
      : generatePaletteChannel(colorGroup.palette);

  return {
    ...basePalette,
    primary: newPrimary,
    chBlue: newChBlue,
  };
};
