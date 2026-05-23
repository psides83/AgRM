'use client';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import useNumberFormat from 'hooks/useNumberFormat';

const MonthlyPayroll = ({ data }) => {
  const { currencyFormat } = useNumberFormat();
  const monthStart = dayjs(data.month).startOf('month').format('D MMM');
  const monthEnd = dayjs(data.month).endOf('month').format('D MMM, YYYY');
  const taxPercent = data.tax * 100;
  const otherPercent = data.otherDeduction * 100;
  const statItems = [
    {
      key: 'approve',
      value: dayjs(data.approvePayroll).format('DD MMM, YYYY'),
      label: 'Approve Payroll',
    },
    {
      key: 'gross',
      value: currencyFormat(data.totalGrossPay, { maximumFractionDigits: 0 }),
      label: 'Total Gross Pay',
    },
    {
      key: 'other',
      value: currencyFormat(data.totalGrossPay * data.otherDeduction, {
        maximumFractionDigits: 0,
      }),
      label: `Other Deduction (${otherPercent}%)`,
    },
    {
      key: 'tax',
      value: currencyFormat(data.totalGrossPay * data.tax, { maximumFractionDigits: 0 }),
      label: `Tax (${taxPercent}%)`,
    },
  ];
  return (
    <Stack direction="column" gap={2} sx={{ pb: 3 }}>
      <Stack
        gap={1.5}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'flex-start', sm: 'space-between' },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Payroll for {monthStart}–{` ${monthEnd}`}
        </Typography>
        <Button variant="soft" sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
          View Pay slip
        </Button>
      </Stack>

      <Paper
        component={Stack}
        direction="column"
        gap={2}
        background={1}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 6, outline: 0 }}
      >
        <Paper
          component={Stack}
          background={2}
          gap={{ xs: 1, sm: 0 }}
          sx={{
            px: 2,
            py: { xs: 2, sm: 1 },
            borderRadius: 4,
            outline: 0,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontWeight: 700 }}>Net Payment</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {data.totalGrossPayPercent}% of Total Gross pay
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: { xs: 'start', sm: 'end' },
              width: { xs: 1, sm: 'auto' },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {currencyFormat(data.netPayment.value, { maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
              {data.netPayment.inWords}
            </Typography>
          </Box>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            minWidth: 0,
            alignSelf: 'stretch',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(4, auto)',
            },
            justifyContent: { sm: 'space-between' },
            gap: 2,
          }}
        >
          {statItems.map((item) => (
            <Box key={item.key} sx={{ minWidth: 0 }}>
              <PayrollKpi value={item.value} label={item.label} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Stack>
  );
};
const PayrollKpi = ({ value, label }) => {
  return (
    <Stack
      direction="column"
      gap={0.5}
      sx={{
        alignItems: 'flex-start',
        textAlign: 'left',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          whiteSpace: { xs: 'normal', sm: 'nowrap' },
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.5,
          whiteSpace: { xs: 'normal', sm: 'nowrap' },
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
export default MonthlyPayroll;
