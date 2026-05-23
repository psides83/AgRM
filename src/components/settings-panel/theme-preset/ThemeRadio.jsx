'use client';

import React from 'react';
import {
  Radio,
  buttonBaseClasses,
  listItemButtonClasses,
  listItemIconClasses,
  listItemSecondaryActionClasses,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

export const themeListRowSx = (variant = 'default', isNested = false) => ({
  minHeight: 36,
  py: 0,

  bgcolor: variant === 'menu' ? 'background.menu' : 'background.menuElevation1',

  pl: variant === 'menu' && isNested ? 4 : 2,

  [`&.${listItemButtonClasses.selected}`]: {
    bgcolor:
      variant === 'menu'
        ? 'rgba(var(--agrm-palette-primary-mainChannel) / calc(var(--agrm-palette-action-selectedOpacity)))'
        : 'action.focused',
  },

  [`&:hover`]: {
    bgcolor: 'action.hover',
  },

  [`& .${listItemIconClasses.root}`]: {
    minWidth: 36,

    [`& .${buttonBaseClasses.root}`]: {
      width: 22,
      height: 22,

      '& input': {
        width: 22,
        height: 22,
      },
    },
  },

  [`& .${listItemSecondaryActionClasses.root}`]: {
    top: '50%',
    transform: 'translateY(-50%)',
  },
});

export const ThemeRadio = ({ checked }) => {
  return (
    <Radio
      checked={checked}
      disableRipple
      sx={{
        p: 0,
        '& svg': { fontSize: 22 },
      }}
      checkedIcon={
        <IconifyIcon
          icon="material-symbols-light:check-circle"
          sx={{ fontSize: 20, color: 'primary.main' }}
        />
      }
    />
  );
};
