import { useTheme } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

export const SlimIllustration = ({ active, hovered }) => {
  const theme = useTheme();

  const isActiveOrHovered = active || hovered;

  const bgColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['50Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['50Channel'], 1);

  const sidebarColor = isActiveOrHovered
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
          <rect x="4" y="4" width="4.04878" height="54" rx="2.02439" fill={sidebarColor} />
        </g>
      ) : (
        <rect x="4" y="4" width="4.04878" height="54" rx="2.02439" fill={sidebarColor} />
      )}
      {isActiveOrHovered ? (
        <>
          <g opacity="0.64">
            <rect x="10.0732" y="4" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
            <rect x="27.8115" y="4" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
            <rect x="10.0732" y="18.0059" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
            <rect x="27.8115" y="18.0059" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
            <rect x="10.0732" y="32.0117" width="33.4512" height="25.9878" rx="2" fill={boxColor} />
          </g>
          <g opacity="0.64">
            <rect x="45.5488" y="4" width="33.4512" height="36.2866" rx="2" fill={boxColor} />
            <rect x="45.5488" y="42.3105" width="33.4512" height="15.689" rx="2" fill={boxColor} />
          </g>
        </>
      ) : (
        <>
          <rect x="10.0732" y="4" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
          <rect x="27.8115" y="4" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
          <rect x="10.0732" y="18.0059" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
          <rect x="27.8115" y="18.0059" width="15.7134" height="11.9817" rx="2" fill={boxColor} />
          <rect x="10.0732" y="32.0117" width="33.4512" height="25.9878" rx="2" fill={boxColor} />
          <rect x="45.5488" y="4" width="33.4512" height="36.2866" rx="2" fill={boxColor} />
          <rect x="45.5488" y="42.3105" width="33.4512" height="15.689" rx="2" fill={boxColor} />
        </>
      )}
    </svg>
  );
};
