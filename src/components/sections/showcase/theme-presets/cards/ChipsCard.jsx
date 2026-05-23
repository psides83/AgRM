import { Chip, Paper, Stack } from '@mui/material';

const chips = ['Linen', 'Suede', 'Satin', 'Silk', 'Velvet', 'Cotton', 'Leather', 'Canvas', 'Denim'];

const ChipsCard = () => {
  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 2,
        overflow: 'hidden',
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <Stack gap={1} flexWrap="wrap">
        {chips.map((fabric) => (
          <Chip key={fabric} label={fabric} color={fabric === 'Linen' ? 'primary' : 'default'} />
        ))}
      </Stack>
    </Paper>
  );
};

export default ChipsCard;
