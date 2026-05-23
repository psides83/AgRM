'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { appraisalCycles } from 'data/hrm/performance-management';
import CustomPagination from 'components/common/CustomPagination';
import AppraisalCycleGrid from 'components/sections/hrm/performance-management/appraisal-cycle/CycleGrid';
import AppraisalCycleHeader from 'components/sections/hrm/performance-management/appraisal-cycle/Header';

const AppraisalCycle = () => {
  return (
    <Paper sx={{ height: 1 }}>
      <AppraisalCycleHeader />
      <Stack
        direction="column"
        gap={4}
        sx={{ px: { xs: 3, md: 5 }, pb: { xs: 3, md: 5 }, pt: 3, flex: 1 }}
      >
        <AppraisalCycleGrid cycles={appraisalCycles} />
        <CustomPagination count={appraisalCycles.length} />
      </Stack>
    </Paper>
  );
};

export default AppraisalCycle;
