import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

const HeaderAction = ({ sx, ...rest }) => {
  const now = dayjs();

  const payPeriodStart = now.startOf('month');
  const payPeriodEnd = now.endOf('month');
  const payDay = now.add(1, 'month').startOf('month');

  return (
    <Stack
      justifyContent={{ xs: 'space-between' }}
      gap={{ xs: 1, sm: 3, md: 5 }}
      {...rest}
      sx={{ ...sx }}
    >
      <Stack direction="column" gap={0.5} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
          Pay Period
        </Typography>
        <Typography component="strong" sx={{ fontWeight: 700 }}>
          {payPeriodStart.format('D MMM')} - {payPeriodEnd.format('D MMM, YYYY')}
        </Typography>
      </Stack>

      <Stack
        direction="column"
        gap={0.5}
        sx={{
          alignItems: { xs: 'center', sm: 'flex-end' },
          textAlign: { xs: 'center', sm: 'right' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
          Pay Day On
        </Typography>
        <Typography component="strong" sx={{ fontWeight: 700 }}>
          {payDay.format('D MMM, YYYY')}
        </Typography>
      </Stack>

      <Stack
        direction="column"
        gap={0.5}
        sx={{ alignItems: { xs: 'flex-end' }, textAlign: { xs: 'right' } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
          Pay Schedule
        </Typography>
        <Typography component="strong" sx={{ fontWeight: 700 }}>
          Monthly
        </Typography>
      </Stack>
    </Stack>
  );
};

export default HeaderAction;
