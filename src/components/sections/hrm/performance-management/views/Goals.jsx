'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { goals } from 'data/hrm/performance-management';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import CustomPagination from 'components/common/CustomPagination';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import GoalsGrid from 'components/sections/hrm/performance-management/goals/GoalsGrid';

const Goals = () => {
  return (
    <Paper>
      <PageHeader
        title="Goals"
        breadcrumb={[
          { label: 'Home', url: '#!' },
          { label: 'Goals', active: true },
        ]}
        actionComponent={
          <Button
            href={paths.hrmPerformanceNewGoal}
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add" />}
          >
            Create Goals
          </Button>
        }
        paperProps={{
          sx: { outline: 0 },
        }}
        sx={{
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}
      />
      <Box
        sx={{
          pt: 3,
          pb: { xs: 3, md: 5 },
          px: { xs: 3, md: 5 },
        }}
      >
        <Stack direction="column" gap={4}>
          <GoalsGrid goals={goals} />
          <CustomPagination count={goals.length} />
        </Stack>
      </Box>
    </Paper>
  );
};

export default Goals;
