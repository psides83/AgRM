import { filledInputClasses } from '@mui/material/FilledInput';
import { formLabelClasses } from '@mui/material/FormLabel';
import { inputAdornmentClasses } from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';
import { inputLabelClasses } from '@mui/material/InputLabel';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';
import IconifyIcon from 'components/base/IconifyIcon';

const PhoneInput = ({ variant, FlagIconButtonProps, ...props }) => {
  const TelInputComponent = variant === 'custom' ? StyledTelInput : BaseTelInput;

  return (
    <TelInputComponent
      defaultCountry="BD"
      variant={variant === 'custom' ? 'filled' : variant}
      getFlagElement={getFlagElement}
      FlagIconButtonProps={{
        size: props.size,
        ...FlagIconButtonProps,
      }}
      unknownFlagElement={
        <IconifyIcon
          icon="material-symbols:flag-2-outline-rounded"
          aria-label="unknown-flag"
          sx={{ aspectRatio: '4 / 3' }}
        />
      }
      {...props}
    />
  );
};

const BaseTelInput = styled(MuiTelInput)(({ theme }) => ({
  ...inputlabelStyles(),
  ...iconifyStyles(),
  ...filledInputStyles(theme),
  ...outlinedInputStyles(theme),
}));

// Utility components
const getFlagElement = (isoCode, { countryName }) => {
  return (
    <IconifyIcon icon={`flag:${isoCode.toString().toLowerCase()}-4x3`} aria-label={countryName} />
  );
};

// Styles
const iconifyStyles = () => ({
  [`& .${inputBaseClasses.root}`]: {
    '& .iconify': { fontSize: 20 },
    [`&.${inputBaseClasses.sizeSmall}`]: { '& .iconify': { fontSize: 16 } },
    [`&.MuiInputBase-sizeLarge`]: { '& .iconify': { fontSize: 24 } },
  },
});

const inputlabelStyles = () => ({
  [`& .${inputLabelClasses.root}.${inputLabelClasses.shrink}.${inputLabelClasses.filled}`]: {
    [`&.${inputLabelClasses.sizeSmall}`]: {
      transform: `translate(38px, 4px) scale(.85)`,
    },
    '&.MuiInputLabel-sizeLarge': {
      transform: `translate(56px, 4px) scale(.85)`,
    },
  },
});

const filledInputStyles = (theme) => ({
  [`& .${filledInputClasses.root}`]: {
    paddingLeft: theme.spacing(0.25),
    [`&.${inputBaseClasses.sizeSmall}`]: { paddingLeft: theme.spacing(0.875) },
    [`&.MuiInputBase-sizeLarge`]: { paddingLeft: theme.spacing(0) },
    [`& .${inputAdornmentClasses.root}`]: { marginRight: 0 },
  },
});

const outlinedInputStyles = (theme) => ({
  [`& .${outlinedInputClasses.root}`]: {
    paddingLeft: theme.spacing(1),
    [`&.${inputBaseClasses.sizeSmall}`]: { paddingLeft: theme.spacing(0.875) },
    [`&.MuiInputBase-sizeLarge`]: { paddingLeft: theme.spacing(1) },
    [`& .${inputAdornmentClasses.root}`]: { marginRight: 0 },
  },
});

// Custom TextField variant
const StyledTelInput = styled(MuiTelInput)(({ theme }) => ({
  [`& .${formLabelClasses.root}`]: {
    fontWeight: theme.typography.fontWeightMedium,
    transform: 'none',
    position: 'static',
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
    fontSize: 12,
    '&.MuiInputLabel-sizeLarge': {
      marginLeft: theme.spacing(2.5),
    },
    [`&.${inputLabelClasses.sizeSmall}`]: {
      marginLeft: theme.spacing(1.5),
    },
    [`&.${inputLabelClasses.shrink}`]: {
      transform: 'none !important',
    },
  },

  [`& .${inputBaseClasses.root}`]: {
    paddingLeft: theme.spacing(1),
    '& .iconify': { fontSize: 20 },
    [`&.${inputBaseClasses.sizeSmall}`]: {
      paddingLeft: theme.spacing(0.875),
      '& .iconify': { fontSize: 16 },
    },
    [`& .${inputAdornmentClasses.root}`]: {
      marginRight: 0,
    },
    [`&.${inputBaseClasses.adornedStart} > .${inputBaseClasses.input}`]: {
      paddingLeft: '0px !important',
    },
    [`& .${inputBaseClasses.input}`]: {
      padding: '8px 16px',
      height: '1.25rem',
      lineHeight: 1.45,
      fontSize: 14,
      '&::-webkit-input-placeholder': {
        opacity: '1 !important',
        color: theme.vars.palette.text.secondary,
      },
      '&::-moz-placeholder': {
        opacity: '1 !important',
        color: theme.vars.palette.text.secondary,
      },
    },
    [`&.${inputBaseClasses.sizeSmall} > .${inputBaseClasses.input}`]: {
      padding: '6px 12px',
      height: '1.125rem',
      fontSize: 14,
    },
    '&.MuiInputBase-sizeLarge': {
      '& .iconify': { fontSize: 24 },
      [`& .${inputBaseClasses.input}`]: {
        paddingLeft: 16,
        padding: '6px 12px',
        height: '1.875rem',
        fontSize: 16,
      },
    },
    [`&.${inputBaseClasses.focused}`]: {
      backgroundColor: theme.vars.palette.primary.lighter,
    },
  },
}));

export default PhoneInput;
