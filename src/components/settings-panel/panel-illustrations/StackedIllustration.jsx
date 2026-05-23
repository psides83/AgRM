import { useTheme } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

export const StackedIllustration = ({ active, hovered }) => {
  const theme = useTheme();

  const isActiveOrHovered = active || hovered;

  const bgColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['50Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['50Channel'], 1);

  const thinSidebarColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['200Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['300Channel'], 1);

  const wideSidebarColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['100Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['200Channel'], 1);

  const boxColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['100Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['100Channel'], 1);

  const clipPathId = `clip0_stacked_${isActiveOrHovered ? 'active' : 'normal'}`;

  return (
    <svg width="83" height="62" viewBox="0 0 83 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="83" height="62" rx="4" fill={bgColor} />
      <g clipPath={`url(#${clipPathId})`}>
        {isActiveOrHovered ? (
          <>
            <g opacity="0.72">
              <rect
                width="4.04878"
                height="54"
                transform="matrix(-1 0 0 1 8.04883 4)"
                fill={thinSidebarColor}
              />
            </g>
          </>
        ) : (
          <>
            <rect
              width="4.04878"
              height="54"
              transform="matrix(-1 0 0 1 8.04883 4)"
              fill={thinSidebarColor}
            />
            <rect
              width="20.2439"
              height="54"
              transform="translate(8.04883 4)"
              fill={wideSidebarColor}
            />
          </>
        )}
      </g>
      {isActiveOrHovered ? (
        <>
          <g opacity="0.64">
            <rect x="30.3174" y="4" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
            <rect x="42.9941" y="4" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
            <rect x="30.3174" y="18.0059" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
            <rect x="42.9941" y="18.0059" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
            <rect x="30.3174" y="32.0117" width="23.3293" height="25.9878" rx="2" fill={boxColor} />
          </g>
          <g opacity="0.64">
            <rect x="55.6709" y="4" width="23.3293" height="36.2866" rx="2" fill={boxColor} />
            <rect x="55.6709" y="42.3105" width="23.3293" height="15.689" rx="2" fill={boxColor} />
          </g>
        </>
      ) : (
        <>
          <rect x="30.3174" y="4" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
          <rect x="42.9941" y="4" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
          <rect x="30.3174" y="18.0059" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
          <rect x="42.9941" y="18.0059" width="10.6524" height="11.9817" rx="2" fill={boxColor} />
          <rect x="30.3174" y="32.0117" width="23.3293" height="25.9878" rx="2" fill={boxColor} />
          <rect x="55.6709" y="4" width="23.3293" height="36.2866" rx="2" fill={boxColor} />
          <rect x="55.6709" y="42.3105" width="23.3293" height="15.689" rx="2" fill={boxColor} />
        </>
      )}
      <defs>
        <clipPath id={clipPathId}>
          <rect x="4" y="4" width="24.2927" height="54" rx="3" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
