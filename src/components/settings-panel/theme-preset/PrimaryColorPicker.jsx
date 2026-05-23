'use client';

import { useCallback, useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_PRIMARY_COLOR } from 'reducers/SettingsReducer';
import { COLOR_GROUPS } from 'theme/primaryColorOverride';
import IconifyIcon from 'components/base/IconifyIcon';

const PrimaryColorPicker = ({ variant = 'default' }) => {
  const { config, configDispatch } = useSettingsContext();

  const primarySwatches = useMemo(() => Array.from(new Set(COLOR_GROUPS.map((g) => g.main))), []);

  const handlePrimaryPick = useCallback(
    (color) => {
      configDispatch({ type: SET_PRIMARY_COLOR, payload: color });
    },
    [configDispatch],
  );

  return (
    <Stack
      direction="column"
      spacing={variant === 'menu' ? 1 : 2}
      sx={{
        justifyContent: 'space-between',
        p: variant === 'menu' ? 2 : 0,
        pb: variant === 'menu' ? 1 : 0,
        mt: variant === 'menu' ? 0 : 3,
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight={600}
        sx={{ minWidth: 100 }}
      >
        Primary Color
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '5px',
        }}
      >
        {primarySwatches.map((color) => {
          const isSelected = config.primaryColor === color;
          return (
            <Box
              key={color}
              onClick={() => handlePrimaryPick(color)}
              sx={{
                position: 'relative',
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: color,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <IconifyIcon
                  icon="material-symbols:check"
                  sx={{
                    fontSize: 14,
                    color: 'background.default',
                    filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default PrimaryColorPicker;
