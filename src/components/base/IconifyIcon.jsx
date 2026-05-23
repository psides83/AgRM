'use client';

import { Icon } from '@iconify/react';
import { useId } from 'react';
import Box from '@mui/material/Box';
import { registerIcons } from 'lib/iconify/iconify-register';

export const IconifyIcon = ({ icon, flipOnRTL = false, color, sx, ...rest }) => {
  const uniqueId = useId();

  // if (!allIconNames.includes(icon)) {
  //   if (!icon.startsWith('noto')) {
  //     console.warn(
  //       [
  //         `Icon "${icon}" is currently loaded online, which may cause flickering effects.`,
  //         `To ensure a smoother experience, please register your icon collection for offline use.`,
  //         `More information is available at: https://aurora.themewagon.com/documentation/icons`,
  //       ].join('\n'),
  //     );
  //   }
  // }

  registerIcons();

  const iconNameClass = icon.split(':').join('-');

  return (
    <Box
      component={Icon}
      className={`iconify ${iconNameClass}`}
      sx={[
        flipOnRTL && {
          transform: (theme) => (theme.direction === 'rtl' ? 'scaleX(-1)' : 'none'),
        },
        { verticalAlign: 'baseline' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
      icon={icon}
      id={uniqueId}
      color={color}
      ssr
    />
  );
};

export default IconifyIcon;
