import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconifyIcon from 'components/base/IconifyIcon';

export default function NumberField({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  size = 'small',
  textFieldProps = {
    variant: 'filled',
  },
  buttonProps = {
    variant: 'soft',
    color: 'neutral',
    shape: 'circle',
  },
  disabled = false,
}) {
  const handleInput = (e) => {
    const num = Number(e.target.value);
    if (!Number.isNaN(num)) onChange(num);
  };

  const decrement = () => {
    const next = value - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const increment = () => {
    const next = value + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <Stack gap={1} sx={{ alignItems: 'center' }}>
      <Button
        size={size}
        onClick={decrement}
        disabled={disabled || (min !== undefined && value <= min)}
        {...buttonProps}
      >
        <IconifyIcon icon="material-symbols:remove-rounded" sx={{ fontSize: 18 }} />
      </Button>

      <TextField
        value={value}
        onChange={handleInput}
        type="number"
        size={size}
        disabled={disabled}
        slotProps={{
          htmlInput: {
            style: { textAlign: 'center', padding: '6px 0' },
          },
        }}
        sx={{
          width: size === 'small' ? 50 : size === 'medium' ? 60 : 70,
          '& input::-webkit-outer-spin-button,& input::-webkit-inner-spin-button': {
            display: 'none',
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
        }}
        {...textFieldProps}
      />

      <Button
        size={size}
        onClick={increment}
        disabled={disabled || (max !== undefined && value >= max)}
        {...buttonProps}
      >
        <IconifyIcon icon="material-symbols:add-rounded" sx={{ fontSize: 18 }} />
      </Button>
    </Stack>
  );
}
