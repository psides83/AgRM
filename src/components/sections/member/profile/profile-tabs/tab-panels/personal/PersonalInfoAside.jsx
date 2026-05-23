import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

const FieldBlock = ({ label, value, labelNoWrap = false }) => (
  <Stack direction="column" gap={1}>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 400,
        color: 'text.secondary',
        ...(labelNoWrap ? { textWrap: 'nowrap' } : {}),
      }}
    >
      {label}
    </Typography>
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Stack>
);
const PersonalInfoAside = ({ data }) => {
  const leftColumn = data.slice(0, 4);
  const rightColumn = data.slice(4);
  return (
    <Paper
      component="aside"
      background={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        outline: 0,
        height: { xs: 'auto', md: 1 },
      }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Stack direction="column" gap={2} sx={{ mb: 3 }}>
          {leftColumn.map((item) => (
            <FieldBlock key={item.label} label={item.label} value={item.value} labelNoWrap />
          ))}
        </Stack>
        <Stack direction="column" gap={2}>
          {rightColumn.map((item) => (
            <FieldBlock key={item.label} label={item.label} value={item.value} />
          ))}
        </Stack>
      </Box>

      <Stack direction="column" gap={2} sx={{ display: { xs: 'flex', sm: 'none' } }}>
        {data.map((item) => (
          <FieldBlock key={item.label} label={item.label} value={item.value} />
        ))}
      </Stack>

      <Grid
        container
        columns={12}
        spacing={2}
        sx={{ display: { xs: 'none', sm: 'flex', md: 'none' } }}
      >
        <Grid size={6}>
          <Stack direction="column" gap={2}>
            {leftColumn.map((item) => (
              <FieldBlock key={item.label} label={item.label} value={item.value} />
            ))}
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack direction="column" gap={2}>
            {rightColumn.map((item) => (
              <FieldBlock key={item.label} label={item.label} value={item.value} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};
export default PersonalInfoAside;
