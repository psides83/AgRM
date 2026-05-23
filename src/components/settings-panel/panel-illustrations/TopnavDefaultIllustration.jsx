import { useTheme } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

export const TopnavDefaultIllustration = ({ active, hovered }) => {
  const theme = useTheme();

  const isActiveOrHovered = active || hovered;

  const bgColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['50Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['50Channel'], 1);

  const topBarColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['200Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['300Channel'], 1);

  const boxColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['100Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['100Channel'], 1);

  return (
    <svg width="83" height="62" viewBox="0 0 83 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="83" height="62" rx="4" fill={bgColor} />
      {isActiveOrHovered ? (
        <g opacity="0.72">
          <rect x="4" y="4" width="75" height="6.07317" rx="2" fill={topBarColor} />
        </g>
      ) : (
        <rect x="4" y="4" width="75" height="6.07317" rx="2" fill={topBarColor} />
      )}
      {isActiveOrHovered ? (
        <g opacity="0.64">
          <rect x="4" y="12.0732" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="20.7012" y="12.0732" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="4" y="24.0615" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="20.7012" y="24.0615" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="4" y="36.0488" width="31.378" height="21.9512" rx="2" fill={boxColor} />
          <rect x="37.4023" y="12.0732" width="41.5976" height="28.2134" rx="2" fill={boxColor} />
          <rect x="37.4023" y="42.3115" width="41.5976" height="15.689" rx="2" fill={boxColor} />
        </g>
      ) : (
        <>
          <rect x="4" y="12.0732" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="20.7012" y="12.0732" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="4" y="24.0615" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="20.7012" y="24.0615" width="14.6768" height="9.96341" rx="2" fill={boxColor} />
          <rect x="4" y="36.0488" width="31.378" height="21.9512" rx="2" fill={boxColor} />
          <rect x="37.4023" y="12.0732" width="41.5976" height="28.2134" rx="2" fill={boxColor} />
          <rect x="37.4023" y="42.3115" width="41.5976" height="15.689" rx="2" fill={boxColor} />
        </>
      )}
    </svg>
  );
};
