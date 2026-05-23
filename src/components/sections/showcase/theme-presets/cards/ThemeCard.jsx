import { Box, Paper, Stack, Typography } from '@mui/material';
import { THEME_DISPLAY_NAMES } from 'theme/palettes';

const ThemeCard = ({ themePreset }) => {
  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 3,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        textAlign: 'center',
        height: 352,
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <Typography variant="h1">{THEME_DISPLAY_NAMES[themePreset]}</Typography>

      <Stack gap={0.5}>
        {['primary', 'secondary', 'neutral', 'success', 'warning', 'info', 'error'].map((color) => (
          <Box
            key={color}
            bgcolor={`${color}.main`}
            sx={{ width: 24, height: 24, borderRadius: 0.5 }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default ThemeCard;
