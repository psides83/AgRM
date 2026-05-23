'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useThemeMode } from 'hooks/useThemeMode';
import { THEME_DISPLAY_NAMES } from 'theme/palettes';
import { allPalettes } from 'theme/palettes';
import { arcticPaletteMainColors } from 'theme/palettes/arctic';
import { darkPaletteMainColors } from 'theme/palettes/dark';
import { draculaPaletteMainColors } from 'theme/palettes/dracula';
import { emberPaletteMainColors } from 'theme/palettes/ember';
import { lightPaletteMainColors } from 'theme/palettes/light';
import { luxuryPaletteMainColors } from 'theme/palettes/luxury';
import { midnightPaletteMainColors } from 'theme/palettes/midnight';
import { naturePaletteMainColors } from 'theme/palettes/nature';
import { retroPaletteMainColors } from 'theme/palettes/retro';
import NestedThemeProvider from 'components/base/NestedThemeProvider';

const THEME_MAIN_COLORS = {
  'default-light': lightPaletteMainColors,
  'default-dark': darkPaletteMainColors,
  luxury: luxuryPaletteMainColors,
  retro: retroPaletteMainColors,
  arctic: arcticPaletteMainColors,
  nature: naturePaletteMainColors,
  ember: emberPaletteMainColors,
  dracula: draculaPaletteMainColors,
  midnight: midnightPaletteMainColors,
};

const ThemePresetCardContent = ({ preset, isSelected, onSelect }) => {
  const mainColors = THEME_MAIN_COLORS[preset];
  const paperColor = mainColors.paper;
  const textPrimaryColor = mainColors.textPrimary;

  const colors = [
    mainColors.primary,
    mainColors.secondary,
    mainColors.error,
    mainColors.warning,
    mainColors.success,
    mainColors.info,
    mainColors.neutral,
    mainColors.paper,
  ].filter(Boolean);

  return (
    <Card
      onClick={() => onSelect(preset)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        borderRadius: 2,
        outlineColor: isSelected ? 'primary.main' : 'divider',
        outlineWidth: isSelected ? 2 : 1,
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {THEME_DISPLAY_NAMES[preset] || preset}
        </Typography>
        <Grid container spacing={0.5} sx={{ width: '100%' }}>
          {colors.map((color, index) => (
            <Grid size={{ xs: 3 }} key={index}>
              <Box
                sx={{
                  aspectRatio: '1/1',
                  borderRadius: 1,
                  bgcolor: color,
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: color === paperColor ? textPrimaryColor : paperColor,
                  textShadow: '0 0 2px rgba(0,0,0,0.1)',
                }}
              >
                A
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const ThemePresetCard = ({ preset, isSelected, onSelect }) => {
  return (
    <NestedThemeProvider preset={preset}>
      <ThemePresetCardContent preset={preset} isSelected={isSelected} onSelect={onSelect} />
    </NestedThemeProvider>
  );
};

const ThemePresetList = () => {
  const { setThemePreset, themePreset } = useThemeMode();

  const defaultThemes = [];
  const customThemes = [];

  Object.entries(allPalettes).forEach(([preset, palette]) => {
    if (preset.startsWith('default-')) {
      defaultThemes.push([preset, palette]);
    } else {
      customThemes.push([preset, palette]);
    }
  });

  defaultThemes.sort(([a], [b]) => {
    if (a === 'default-light') return -1;
    if (b === 'default-light') return 1;
    return 0;
  });

  const handleThemeSelect = (preset) => {
    setThemePreset(preset);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {defaultThemes.map(([preset]) => (
          <Box key={`${preset}-${themePreset}`}>
            <ThemePresetCard
              preset={preset}
              isSelected={preset === themePreset}
              onSelect={handleThemeSelect}
            />
          </Box>
        ))}
        {customThemes.map(([preset]) => (
          <Box key={`${preset}-${themePreset}`}>
            <ThemePresetCard
              preset={preset}
              isSelected={preset === themePreset}
              onSelect={handleThemeSelect}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ThemePresetList;
