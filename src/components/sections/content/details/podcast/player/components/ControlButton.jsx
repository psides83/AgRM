import { Button } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const ControlButton = ({ icon, iconProps, children, sx, ...rest }) => {
  return (
    <Button
      shape={children ? undefined : 'square'}
      size="small"
      color="neutral"
      sx={{ gap: children ? 0.5 : 0, ...sx }}
      {...rest}
    >
      <IconifyIcon
        icon={icon}
        sx={{
          fontSize: 18,
          flexShrink: 0,
          ...iconProps,
        }}
      />
      {children}
    </Button>
  );
};

export default ControlButton;
