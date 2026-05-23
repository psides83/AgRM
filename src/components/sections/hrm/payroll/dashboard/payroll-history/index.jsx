import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { payrollHistoryData } from 'data/hrm/payroll/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import PayrollHistoryCard from './PayrollHistoryCard';

const PayrollHistory = () => {
  return (
    <Paper sx={{ p: { xs: 3, md: 5 }, height: 1 }}>
      <SectionHeader
        title="Payroll History"
        subTitle="Keep track of past payroll activity"
        actionComponent={<DashboardMenu size="medium" />}
      />
      <Grid
        container
        spacing={1}
        sx={{ overflowY: 'auto', maxHeight: { xs: 1, md: 315, lg: 399 } }}
      >
        {payrollHistoryData.map((payroll) => (
          <Grid key={payroll.id} size={{ xs: 12, lg: 6, xl: 12 }}>
            <PayrollHistoryCard {...payroll} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PayrollHistory;
