'use client';

import { usePathname } from 'next/navigation';
import { Box, Link, Typography, typographyClasses } from '@mui/material';
import paths, { rootPaths } from 'routes/paths';

const logoSrc = '/deere-icons/tractor-row-crop.svg';

const Logo = ({ sx, viewBox, showName = true, isShowcase, ...rest }) => {
  const pathname = usePathname();

  return (
    <Link
      href={pathname === '/' || pathname === paths.showcase ? rootPaths.root : paths.crm}
      underline="none"
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        '&:hover': {
          [`& .${typographyClasses.root}`]: {
            color: 'primary.main',
          },
        },
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="AgRM"
        sx={{
          display: 'block',
          height: 40,
          width: 40,
          objectFit: 'contain',
          flexShrink: 0,
          ...sx,
        }}
        {...rest}
      />
      {showName && (
        <Typography
          sx={{
            color: 'text.secondary',
            fontWeight: 'medium',
            fontSize: 29.5,
            lineHeight: 1,
            margin: 1,
            marginLeft: 0.625,
            letterSpacing: 0,
            transition: ({ transitions }) => transitions.create('color'),
          }}
        >
          AgRM
        </Typography>
      )}
    </Link>
  );
};

export default Logo;
