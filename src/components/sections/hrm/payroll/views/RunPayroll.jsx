'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import HeaderAction from 'components/sections/hrm/payroll/common/HeaderAction';
import EarningsDeductionsMain from 'components/sections/hrm/payroll/earnings';

const RunPayroll = () => {
  return (
    <Paper component={Grid} container>
      <Grid size={12}>
        <PageHeader
          title="Run Payroll"
          breadcrumb={[
            { label: 'Home', url: '#!' },
            { label: 'Run Payroll', active: true },
          ]}
          actionComponent={<HeaderAction />}
        />
      </Grid>

      <Grid size={12}>
        <EarningsDeductionsMain />
      </Grid>
    </Paper>
  );
};

export default RunPayroll;
