'use client';

import NextImage from 'next/image';
import { styled } from '@mui/material/styles';
import { useThemeMode } from 'hooks/useThemeMode';

const StyledNextImage = styled(NextImage)({});

const Image = ({ src, alt = '', sx, ...props }) => {
  const { isDark } = useThemeMode();

  let imageSrc;

  if (typeof src === 'string' || src?.src) {
    imageSrc = src;
  } else {
    imageSrc = isDark ? src.dark : src.light;
  }

  return <StyledNextImage src={imageSrc} alt={alt} unoptimized={true} sx={sx} {...props} />;
};

export default Image;
