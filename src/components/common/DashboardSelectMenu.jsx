import { MenuItem, TextField } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';

const defaultOptions = [
  {
    value: 1,
    label: 'Last month',
  },
  {
    value: 6,
    label: 'Last 6 months',
  },
  {
    value: 12,
    label: 'Last 12 months',
  },
];

const DashboardSelectMenu = ({
  options = defaultOptions,
  onChange,
  defaultValue = defaultOptions[0].value,
  label,
  size = 'small',
  variant = 'custom',
  menuItemProps,
  sx,
  ...rest
}) => {
  const Component = variant === 'custom' ? StyledTextField : TextField;
  const handleChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Component
      select
      defaultValue={defaultValue}
      label={variant !== 'custom' ? label : undefined}
      variant={variant !== 'custom' ? variant : undefined}
      size={size}
      onChange={({ target: { value } }) => handleChange(value)}
      sx={{ width: 150, minWidth: 120, ...sx }}
      {...rest}
    >
      {options.map((option) => (
        <MenuItem {...menuItemProps} value={option.value} key={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Component>
  );
};

export default DashboardSelectMenu;
