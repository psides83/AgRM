import { Box, Slider, Typography } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';

const FontSizePanel = () => {
  const {
    config: { fontSize },
    setConfig,
  } = useSettingsContext();

  const handleChange = (_, newValue) => setConfig({ fontSize: newValue });

  return (
    <Box sx={{ width: 1 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight={600}
        sx={{ minWidth: 100, mb: 1 }}
      >
        Font Size
      </Typography>
      <Slider
        aria-label="Font Size"
        value={fontSize}
        onChange={handleChange}
        getAriaValueText={(value) => `${value}px`}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}px`}
        shiftStep={1}
        step={1}
        min={12}
        max={20}
        marks
      />
    </Box>
  );
};

export default FontSizePanel;
