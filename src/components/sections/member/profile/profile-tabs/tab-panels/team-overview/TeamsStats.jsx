import { Box, Paper, Stack, Typography } from '@mui/material';

const TeamsStats = ({ data }) => {
  return (
    <Stack direction="column" gap={1} sx={{ pb: 3 }}>
      {data.map((stat) => (
        <Paper
          key={stat.id}
          background={1}
          sx={{ outline: 0, borderRadius: 6, p: { xs: 2, md: 3 } }}
        >
          <Stack
            gap={{ xs: 2, sm: 1 }}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Stat
              label="Assigned Team"
              value={stat.team}
              sx={{
                flexShrink: 0,
              }}
            />

            <Stack
              gap={{ xs: 2, sm: 3 }}
              sx={{
                display: { xs: 'grid', sm: 'flex' },
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))' },
                flexDirection: { sm: 'row' },
                width: 'auto',
                minWidth: 0,
              }}
            >
              <Stat label="Completed" value={stat.stats.completed} sx={{ textAlign: 'right' }} />
              <Stat label="Active" value={stat.stats.active} sx={{ textAlign: 'right' }} />
              <Stat label="Archived" value={stat.stats.archived} sx={{ textAlign: 'right' }} />
              <Stat label="Total Project" value={stat.stats.total} sx={{ textAlign: 'right' }} />
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
const Stat = ({ label, value, ...rest }) => {
  return (
    <Box {...rest}>
      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.625 }}>
        {value}
      </Typography>
    </Box>
  );
};
export default TeamsStats;
