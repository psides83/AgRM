import { InputAdornment, TextField } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';

const SearchTextField = ({ sx, variant = 'custom', iconSx, ...rest }) => {
  const Component = variant === 'custom' ? StyledTextField : TextField;
  return (
    <Component
      id="search-box"
      type="search"
      variant={variant !== 'custom' ? variant : undefined}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconifyIcon icon="material-symbols:search-rounded" sx={{ ...iconSx }} />
            </InputAdornment>
          ),
        },
      }}
      {...rest}
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
};

export default SearchTextField;
