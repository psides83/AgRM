import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { payRunSummary, payrollTotals } from 'data/hrm/payroll/payroll-review';
import BottomActions from './BottomActions';
import PayRunSummary from './PayRunSummary';
import PayrollTotals from './PayrollTotals';
import PayrollDetails from './details/PayrollDetails';

const PayrollPreviewMain = () => {
  return (
    <Paper sx={{ p: { xs: 3, md: 5 }, height: 1 }}>
      <Container disableGutters maxWidth="md">
        <Stack direction="column" gap={5}>
          <Stack direction="column" gap={5} divider={<Divider flexItem />}>
            <PayRunSummary summary={payRunSummary} />
            <PayrollTotals totals={payrollTotals} />
            <PayrollDetails />
          </Stack>
          <BottomActions />
        </Stack>
      </Container>
    </Paper>
  );
};

export default PayrollPreviewMain;
