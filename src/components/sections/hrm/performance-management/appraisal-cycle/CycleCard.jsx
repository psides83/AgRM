import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getStatusChipColor } from 'data/hrm/performance-management';
import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';

const AppraisalCycleCard = ({
  id,
  title,
  reviewPeriod,
  startDate,
  endDate,
  status,
  sx,
  ...props
}) => {
  return (
    <Paper
      component={Link}
      href="#!"
      underline="none"
      background={1}
      {...props}
      sx={{
        p: 3,
        display: 'block',
        borderRadius: 6,
        outline: 0,
        height: 1,
        '&:hover': { bgcolor: 'background.elevation2' },
        ...sx,
      }}
    >
      <Stack gap={2}>
        <Typography variant="h6" sx={{ lineHeight: '32px', flexGrow: 1, lineClamp: 2 }}>
          {title}
        </Typography>
        <DashboardMenu />
      </Stack>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={400} sx={{ mb: 3 }}>
        Review Period{`  `}
        <Box component="span" fontWeight={600}>
          {dayjs(reviewPeriod.start).format('MMM D, YYYY')} -{' '}
          {dayjs(reviewPeriod.end).format('MMM D, YYYY')}
        </Box>
      </Typography>
      <Stack gap={2} sx={{ justifyContent: 'space-between' }}>
        <Stack gap={2}>
          <Typography variant="caption" color="text.secondary">
            Start{` `}
            <Box component="strong" color="text.primary">
              {dayjs(startDate).format('MMM D, YYYY')}
            </Box>
          </Typography>

          <Typography variant="caption" color="text.secondary">
            End{` `}
            <Box component="strong" color="text.primary">
              {dayjs(endDate).format('MMM D, YYYY')}
            </Box>
          </Typography>
        </Stack>

        <Chip label={status} color={getStatusChipColor(status)} />
      </Stack>
    </Paper>
  );
};

export default AppraisalCycleCard;
