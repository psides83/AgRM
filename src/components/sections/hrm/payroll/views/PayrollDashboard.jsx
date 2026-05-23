'use client';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import CurrentPayrollRun from 'components/sections/hrm/payroll/dashboard/current-payroll-run';
import PaySummary from 'components/sections/hrm/payroll/dashboard/pay-summary';
import PayrollCostSummary from 'components/sections/hrm/payroll/dashboard/payroll-cost-summary';
import PayrollHistory from 'components/sections/hrm/payroll/dashboard/payroll-history';

const PayrollDashboard = () => {
  return (
    <Grid container>
      <Grid size={12}>
        <PageHeader
          title="Payroll"
          breadcrumb={[
            { label: 'Home', url: '#!' },
            { label: 'Payroll', active: true },
          ]}
          actionComponent={
            <Button
              variant="soft"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:settings-outline" />}
            >
              Settings
            </Button>
          }
          sx={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <CurrentPayrollRun />
      </Grid>
      <Grid size={{ xs: 12, md: 12, lg: 6 }} order={{ md: 1, lg: 0 }}>
        <PaySummary />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 12, xl: 4 }}>
        <PayrollHistory />
      </Grid>
      <Grid size={{ xs: 12, xl: 8 }} order={{ md: 1, lg: 0 }}>
        <PayrollCostSummary />
      </Grid>
    </Grid>
  );
};

export default PayrollDashboard;
