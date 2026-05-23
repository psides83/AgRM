import { useTheme } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

export const TopnavStackedIllustration = ({ active, hovered }) => {
  const theme = useTheme();

  const isActiveOrHovered = active || hovered;

  const bgColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['50Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['50Channel'], 1);

  const thinTopBarColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['200Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['300Channel'], 1);

  const wideTopBarColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['100Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['200Channel'], 1);

  const boxColor = isActiveOrHovered
    ? cssVarRgba(theme.vars.palette.chBlue['100Channel'], 1)
    : cssVarRgba(theme.vars.palette.chGrey['100Channel'], 1);

  const clipPathId = `clip0_topnav_stacked_${isActiveOrHovered ? 'active' : 'normal'}`;

  return (
    <svg width="83" height="62" viewBox="0 0 83 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="83" height="62" rx="4" fill={bgColor} />
      <g clipPath={`url(#${clipPathId})`}>
        {isActiveOrHovered ? (
          <>
            <g opacity="0.72">
              <rect
                width="75"
                height="2.00792"
                transform="matrix(-1 0 0 1 79 4)"
                fill={thinTopBarColor}
              />
            </g>

            <g opacity="0.78">
              <rect
                width="75"
                height="4.01583"
                transform="translate(4 6.00781)"
                fill={wideTopBarColor}
              />
            </g>
          </>
        ) : (
          <>
            <rect
              width="75"
              height="2.00792"
              transform="matrix(-1 0 0 1 79 4)"
              fill={thinTopBarColor}
            />
            <rect
              width="75"
              height="4.01583"
              transform="translate(4 6.00781)"
              fill={wideTopBarColor}
            />
          </>
        )}
      </g>
      {isActiveOrHovered ? (
        <g opacity="0.64">
          <rect x="4" y="12.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="20.7012" y="12.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="4" y="24.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="20.7012" y="24.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="4" y="36.0234" width="31.378" height="21.9759" rx="2" fill={boxColor} />
          <rect x="37.4023" y="12.0234" width="41.5976" height="28.2628" rx="2" fill={boxColor} />
          <rect x="37.4023" y="42.3105" width="41.5976" height="15.689" rx="2" fill={boxColor} />
        </g>
      ) : (
        <>
          <rect x="4" y="12.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="20.7012" y="12.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="4" y="24.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="20.7012" y="24.0234" width="14.6768" height="9.97577" rx="2" fill={boxColor} />
          <rect x="4" y="36.0234" width="31.378" height="21.9759" rx="2" fill={boxColor} />
          <rect x="37.4023" y="12.0234" width="41.5976" height="28.2628" rx="2" fill={boxColor} />
          <rect x="37.4023" y="42.3105" width="41.5976" height="15.689" rx="2" fill={boxColor} />
        </>
      )}
      <defs>
        <clipPath id={clipPathId}>
          <rect x="4" y="4" width="75" height="6.02375" rx="2" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
