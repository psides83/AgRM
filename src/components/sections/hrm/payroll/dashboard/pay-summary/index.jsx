import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { paySummaryKpis } from 'data/hrm/payroll/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import PayKPI from './PayKPI';

const PaySummary = () => {
  return (
    <Paper component={Stack} direction="column" sx={{ p: { xs: 3, md: 5 }, height: 1 }}>
      <SectionHeader
        title="Pay Summary"
        subTitle="Here's what was processed in the previous payroll"
        actionComponent={<DashboardMenu size="medium" />}
      />
      <Grid container spacing={1} flexGrow={1}>
        {paySummaryKpis.map((kpi) => (
          <Grid key={kpi.id} size={{ xs: 6, sm: 3, lg: 6, xl: 3 }}>
            <PayKPI {...kpi} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PaySummary;
