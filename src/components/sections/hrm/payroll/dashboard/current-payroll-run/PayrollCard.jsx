import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { currentPayrollRun } from 'data/hrm/payroll/dashboard';
import dayjs from 'dayjs';

const PayrollCard = () => {
  const { start, end, payDate, paySchedule, approvePayroll, employeeNo } = currentPayrollRun;

  return (
    <Paper background={1} sx={{ outline: 0, py: 3, px: 4, borderRadius: 6, height: 1 }}>
      <Stack direction="column" gap={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row', md: 'column', xl: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center', md: 'flex-start', xl: 'center' }}
          gap={2}
        >
          <Typography variant="h6" fontWeight={600} lineHeight={1.5}>
            Payroll: {dayjs(start).format('D MMM')} - {dayjs(end).format('D MMM')},{' '}
            {dayjs(end).format('YYYY')}
          </Typography>
          <Button variant="contained">Run Payroll</Button>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3, md: 6, xl: 3 }}>
            <CardInfo
              title="Pay Date"
              value={dayjs(payDate).format('D MMM, YYYY')}
              sx={{ alignItems: 'flex-start' }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 6, xl: 3 }}>
            <CardInfo
              title="Pay Schedule"
              value={paySchedule}
              sx={{
                alignItems: { xs: 'flex-end', sm: 'flex-start', md: 'flex-end', xl: 'flex-start' },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 6, xl: 3 }}>
            <CardInfo
              title="Approve Payroll"
              value={dayjs(approvePayroll).format('D MMM, YYYY')}
              sx={{ alignItems: 'flex-start' }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 6, xl: 3 }}>
            <CardInfo
              title="Employee No."
              value={employeeNo}
              sx={{
                alignItems: { xs: 'flex-end', sm: 'flex-start', md: 'flex-end', xl: 'flex-start' },
              }}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default PayrollCard;

const CardInfo = ({ title, value, ...rest }) => {
  return (
    <Stack direction="column" gap={1} {...rest}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Stack>
  );
};
