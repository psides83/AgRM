import { arcticPalette } from './arctic';
import { darkPalette } from './dark';
import { draculaPalette } from './dracula';
import { emberPalette } from './ember';
import { lightPalette } from './light';
import { luxuryPalette } from './luxury';
import { midnightPalette } from './midnight';
import { naturePalette } from './nature';
import { retroPalette } from './retro';

export const THEME_DISPLAY_NAMES = {
  'default-light': 'Light',
  'default-dark': 'Dark',
  luxury: 'Luxury',
  retro: 'Retro',
  arctic: 'Arctic',
  nature: 'Nature',
  ember: 'Ember',
  dracula: 'Dracula',
  midnight: 'Midnight',
};

export const lightPalettes = {
  'default-light': lightPalette,
  luxury: luxuryPalette,
  retro: retroPalette,
  arctic: arcticPalette,
  nature: naturePalette,
};

export const darkPalettes = {
  'default-dark': darkPalette,
  ember: emberPalette,
  dracula: draculaPalette,
  midnight: midnightPalette,
};

export const allPalettes = {
  ...lightPalettes,
  ...darkPalettes,
};
