import { useTheme } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

export const ComboIllustration = ({ active, hovered }) => {
  const theme = useTheme();

  const isActiveOrHovered = active || hovered;

  const bgColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['50Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['50Channel'], 1);

  const topBarAndSidebarColor = isActiveOrHovered
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
          <rect x="4" y="4" width="75" height="6.07317" rx="2" fill={topBarAndSidebarColor} />
        </g>
      ) : (
        <rect x="4" y="4" width="75" height="6.07317" rx="2" fill={topBarAndSidebarColor} />
      )}
      {isActiveOrHovered ? (
        <g opacity="0.72">
          <rect
            x="4"
            y="12.0732"
            width="20.2439"
            height="45.9268"
            rx="3"
            fill={topBarAndSidebarColor}
          />
        </g>
      ) : (
        <rect
          x="4"
          y="12.0732"
          width="20.2439"
          height="45.9268"
          rx="3"
          fill={topBarAndSidebarColor}
        />
      )}
      {isActiveOrHovered ? (
        <>
          <g opacity="0.64">
            <rect x="26.2686" y="12.0732" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
            <rect x="39.958" y="12.0732" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
            <rect x="26.2686" y="24.0615" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
            <rect x="39.958" y="24.0615" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
            <rect x="26.2686" y="36.0488" width="25.3537" height="21.9512" rx="2" fill={boxColor} />
          </g>
          <g opacity="0.64">
            <rect x="53.6465" y="12.0732" width="25.3537" height="28.2134" rx="2" fill={boxColor} />
            <rect x="53.6465" y="42.3115" width="25.3537" height="15.689" rx="2" fill={boxColor} />
          </g>
        </>
      ) : (
        <>
          <rect x="26.2686" y="12.0732" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
          <rect x="39.958" y="12.0732" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
          <rect x="26.2686" y="24.0615" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
          <rect x="39.958" y="24.0615" width="11.6646" height="9.96341" rx="2" fill={boxColor} />
          <rect x="26.2686" y="36.0488" width="25.3537" height="21.9512" rx="2" fill={boxColor} />
          <rect x="53.6465" y="12.0732" width="25.3537" height="28.2134" rx="2" fill={boxColor} />
          <rect x="53.6465" y="42.3115" width="25.3537" height="15.689" rx="2" fill={boxColor} />
        </>
      )}
    </svg>
  );
};
