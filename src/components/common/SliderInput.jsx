import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SliderInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueFormatter = (val) => `${val}%`,
  sx,
}) {
  return (
    <Paper background={1} sx={{ outline: 0, width: 1, px: 2, py: 0.5, borderRadius: 2, ...sx }}>
      <Stack gap={1}>
        <Slider
          className="slider-input-slider"
          value={value}
          onChange={(_, v) => onChange(v)}
          min={min}
          max={max}
          step={step}
          aria-label={label}
          valueLabelDisplay="auto"
          valueLabelFormat={valueFormatter}
          getAriaValueText={valueFormatter}
        />
        {showValue && (
          <Typography
            className="slider-input-text"
            fontWeight={700}
            textAlign="right"
            sx={{ minWidth: 50 }}
          >
            {valueFormatter(value)}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
