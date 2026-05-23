import { generatePaletteChannel } from 'lib/utils';
import {
  arcticPrimary,
  draculaPrimary,
  emberPrimary,
  luxuryPrimary,
  midnightPrimary,
  naturePrimary,
  primaryRetro,
} from 'theme/colors';
import { blue, green } from 'theme/colors/base';

export const THEME_PRIMARY_PALETTES = {
  'default-light': blue,
  midnight: midnightPrimary,
  dracula: draculaPrimary,
  ember: emberPrimary,
  luxury: luxuryPrimary,
  nature: naturePrimary,
  arctic: arcticPrimary,
  retro: primaryRetro,
};

export const getThemePrimaryColors = (themePreset) => {
  return THEME_PRIMARY_PALETTES[themePreset] || blue;
};

export const isBlueTheme = (themePreset) => {
  return themePreset === 'midnight' || themePreset === 'dracula' || themePreset === 'ember';
};

export const getBlueThemePrimaryPalette = (themePreset) => {
  if (!isBlueTheme(themePreset)) return null;
  return getThemePrimaryColors(themePreset);
};

const darkAccentGreen = generatePaletteChannel({
  700: green[700],
  900: green[900],
  950: green[950],
});

export const getDarkModeAccentPalette = (accentPalette, isDark, themePreset) => {
  if (!isDark) return accentPalette;

  if (isBlueTheme(themePreset)) {
    return getThemePrimaryColors(themePreset);
  }

  return darkAccentGreen;
};
