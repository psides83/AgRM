'use client';

import Paper from '@mui/material/Paper';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import HeaderAction from 'components/sections/hrm/payroll/common/HeaderAction';
import PayrollPreviewMain from 'components/sections/hrm/payroll/payroll-review';

const PayrollReview = () => {
  return (
    <Paper>
      <PageHeader
        title="Payroll Review"
        breadcrumb={[
          { label: 'Home', url: '#!' },
          { label: 'Payroll Review', active: true },
        ]}
        actionComponent={<HeaderAction />}
      />

      <PayrollPreviewMain />
    </Paper>
  );
};

export default PayrollReview;
