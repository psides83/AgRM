'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import HeaderAction from 'components/sections/hrm/payroll/common/HeaderAction';
import PayrollPreviewMain from 'components/sections/hrm/payroll/payroll-review';

const PayrollPreview = () => {
  return (
    <Paper component={Grid} container>
      <Grid size={12}>
        <PageHeader
          title="Payroll Review"
          breadcrumb={[
            { label: 'Home', url: '#!' },
            { label: 'Payroll Review', active: true },
          ]}
          actionComponent={<HeaderAction />}
        />
      </Grid>

      <Grid size={12}>
        <PayrollPreviewMain />
      </Grid>
    </Paper>
  );
};

export default PayrollPreview;
