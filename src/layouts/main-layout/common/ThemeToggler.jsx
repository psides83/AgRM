'use client';

import { Fragment, useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Menu, keyframes, listItemButtonClasses } from '@mui/material';
import { cssVarRgba } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';
import ThemeList from 'components/settings-panel/theme-preset/ThemeList';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sizeMap = {
  default: { box: 39, radius: 7.5, ringInset: 1 },
  slim: {
    box: 32,
    radius: 7.25,
    ringInset: 0.85,
  },
};

const ThemeToggler = ({ type = 'default' } = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const spinAnimation = `${spin} 4s linear infinite`;
  const sizes = sizeMap[type];

  const handleClick = useCallback(
    (event) => {
      if (searchParams.size > 0) {
        router.replace(pathname);
      }
      setAnchorEl(event.currentTarget);
    },
    [searchParams, router, pathname],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const getIcon = () => {
    return `material-symbols${type === 'slim' ? '' : '-light'}:palette-outline`;
  };

  return (
    <Fragment>
      <Box
        sx={{
          position: 'relative',
          width: sizes.box,
          height: sizes.box,

          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: sizes.radius,
            zIndex: 2,
            ...(type === 'slim'
              ? {
                  background: ({ vars }) =>
                    `conic-gradient(from 0deg, ${vars.palette.secondary.main}, ${cssVarRgba(vars.palette.secondary.mainChannel, 0.1)}, ${vars.palette.secondary.main})`,
                  animation: spinAnimation,
                }
              : {
                  background: ({ vars }) =>
                    `linear-gradient(to bottom, ${vars.palette.secondary.main},
          ${(cssVarRgba(vars.palette.secondary.mainChannel, 0.01), 'transparent')})`,
                  animation: spinAnimation,
                }),
          },

          '&::after': {
            content: '""',
            position: 'absolute',
            inset: sizes.ringInset,
            borderRadius: sizes.radius,
            zIndex: type === 'slim' ? 3 : 1,
            background: ({ vars }) =>
              type === 'slim' ? vars.palette.background.paper : vars.palette.secondary.light,
          },
        }}
      >
        <Button
          shape="circle"
          color="neutral"
          variant={type === 'default' ? 'soft' : 'text'}
          onClick={handleClick}
          size={type === 'slim' ? 'small' : 'medium'}
          sx={[
            {
              position: 'absolute',
              zIndex: 10,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              ...(type === 'slim' && {
                backgroundColor: ({ vars }) => vars.palette.background.paper,
                '&:hover': {
                  backgroundColor: ({ vars }) => vars.palette.background.paper,
                },
              }),
            },
          ]}
        >
          <IconifyIcon
            icon={getIcon()}
            sx={{
              fontSize: type === 'slim' ? 18 : 22,
              position: 'relative',
              zIndex: 5,
            }}
          />
        </Button>
      </Box>

      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 288,
            },
          },
        }}
      >
        <Box sx={{ [`& .${listItemButtonClasses.root}`]: { borderRadius: 0 } }}>
          <ThemeList variant="menu" />
        </Box>
      </Menu>
    </Fragment>
  );
};

export default ThemeToggler;
