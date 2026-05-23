'use client';

import { Box, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useVisionMode } from 'providers/VisionModeProvider';
import IconifyIcon from 'components/base/IconifyIcon';

const visionOptions = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Shows all colors normally',
  },
  {
    value: 'protanopia',
    label: 'Protanopia',
    description: 'Hard to see red shades',
  },
  {
    value: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Hard to see green shades',
  },
  {
    value: 'tritanopia',
    label: 'Tritanopia',
    description: 'Hard to see blue shades',
  },
  {
    value: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Shows only black and white',
  },
];

const VisionModePanel = () => {
  const { mode, setMode } = useVisionMode();

  const handleChange = (event) => {
    setMode(event.target.value);
  };

  return (
    <RadioGroup name="vision-mode" value={mode} onChange={handleChange}>
      <Stack
        direction="column"
        sx={{
          gap: 0.5,
        }}
      >
        {visionOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                checkedIcon={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 28,
                      height: 28,
                    }}
                  >
                    <IconifyIcon
                      icon="material-symbols-light:check-circle"
                      sx={{ color: 'primary.main', fontSize: '22px !important' }}
                    />
                  </Box>
                }
                sx={{
                  p: 0.5,
                  width: 28,
                  height: 28,
                  ...(mode !== option.value && {
                    '& svg': {
                      width: 16,
                      height: 16,
                    },
                  }),
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              />
            }
            label={
              <Stack
                direction="column"
                sx={{
                  flex: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: mode === option.value ? 600 : 400,
                    color: mode === option.value ? 'primary.main' : 'text.primary',
                  }}
                >
                  {option.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                  }}
                >
                  {option.description}
                </Typography>
              </Stack>
            }
            disableTypography
            sx={{
              margin: 0,
              width: '100%',
              p: 1,
              borderRadius: 2,
              alignItems: 'flex-start',
              bgcolor: mode === option.value ? 'primary.lighter' : 'background.elevation1',
              '&:hover': {
                bgcolor: mode === option.value ? 'primary.lighter' : 'action.hover',
              },
              '& .MuiFormControlLabel-label': {
                flex: 1,
                ml: 1,
                width: '100%',
              },
            }}
          />
        ))}
      </Stack>
    </RadioGroup>
  );
};

export default VisionModePanel;
