import { Box, Paper, Stack, Typography } from '@mui/material';
import DashboardMenu from 'components/common/DashboardMenu';

const AppliedLeave = ({ data }) => {
  return (
    <Paper background={1} sx={{ p: { xs: 2, sm: 3 }, outline: 0, borderRadius: 4, minWidth: 0 }}>
      <Stack direction="column" gap={2} sx={{ width: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Applied Leave
        </Typography>
        <Stack
          direction="column"
          gap={1}
          sx={{ maxHeight: { xs: 'auto', sm: '300px' }, overflow: 'auto' }}
        >
          {data.map((item, index) => (
            <Paper
              key={index}
              background={2}
              sx={{ p: 2, outline: 0, borderRadius: 2, minWidth: 0 }}
            >
              <Stack
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  width: 1,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '120px minmax(0, 1fr)',
                      sm: 'minmax(0, 1fr) minmax(0, 1fr)',
                      md: '120px 100px',
                    },
                    justifyContent: { xs: 'start' },
                    gap: { xs: 1.5, sm: 2, md: 5 },
                  }}
                >
                  <Stack direction="column" gap={0.5} sx={{ minWidth: 0, overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.date}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 400, color: 'text.secondary' }}
                    >
                      {item.duration}
                      {` hrs `}
                      {item.type}
                    </Typography>
                  </Stack>
                  <Stack direction="column" gap={0.5} sx={{ minWidth: 0, overflow: 'hidden' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 400, color: 'text.secondary' }}
                      noWrap
                    >
                      Reason
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                      {item.reason}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ flexShrink: 0 }}>
                  <DashboardMenu size="medium" />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
export default AppliedLeave;
