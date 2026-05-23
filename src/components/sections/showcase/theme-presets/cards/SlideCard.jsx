'use client';

import { useState } from 'react';
import { Paper, Slider, Stack, TextField } from '@mui/material';

const MIN = 0;
const MAX = 2500;

const SlideCard = () => {
  const [value, setValue] = useState([MIN, 1300]);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper
      background={1}
      sx={{
        p: 2,
        borderRadius: 4,
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <Slider
        min={MIN}
        max={MAX}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />

      <Stack gap={1}>
        <TextField
          variant="filled"
          label="Min"
          type="number"
          value={value[0]}
          onChange={(e) => setValue([Math.min(Number(e.target.value), value[1]), value[1]])}
          slotProps={{
            htmlInput: {
              min: MIN,
              max: value[1],
            },
          }}
          sx={{ flex: 1 }}
        />

        <TextField
          variant="filled"
          label="Max"
          type="number"
          value={value[1]}
          onChange={(e) => setValue([value[0], Math.max(Number(e.target.value), value[0])])}
          slotProps={{
            htmlInput: {
              min: value[0],
              max: MAX,
            },
          }}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Paper>
  );
};

export default SlideCard;
