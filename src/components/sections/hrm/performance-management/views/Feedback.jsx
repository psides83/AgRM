'use client';

import { Box } from '@mui/material';
import DashboardSelectMenu from 'components/common/DashboardSelectMenu';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import HRMFeedbackMain from 'components/sections/hrm/performance-management/feedback';

const Feedback = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <PageHeader
        title="Feedback"
        breadcrumb={[
          { label: 'Home', url: '#!' },
          { label: 'Feedback', active: true },
        ]}
        actionComponent={
          <DashboardSelectMenu
            size="medium"
            defaultValue={6}
            options={[
              {
                value: 1,
                label: 'Sort by - Last month',
              },
              {
                value: 6,
                label: 'Sort by - Last 6 month',
              },
              {
                value: 12,
                label: 'Sort by - Last 12 month',
              },
            ]}
            sx={{ maxWidth: 234, width: 1 }}
          />
        }
        paperProps={{
          sx: { outline: 0 },
        }}
      />

      <HRMFeedbackMain />
    </Box>
  );
};

export default Feedback;
