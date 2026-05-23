import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTagChipColor } from 'data/hrm/performance-management';
import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';
import GoalDialog from './goal-dialog';

const GoalCard = ({ goal }) => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <Paper
        component={Link}
        background={1}
        href="#!"
        underline="none"
        onClick={() => setOpen(true)}
        sx={{
          height: 1,
          outline: 0,
          p: 3,
          display: 'block',
          borderRadius: 4,
          overflow: 'hidden',
          '&:hover': {
            bgcolor: 'background.elevation2',
          },
        }}
      >
        <Stack direction="column" gap={3}>
          <Stack direction="column" gap={1}>
            <Stack gap={2}>
              <Typography variant="h6" fontWeight={600} sx={{ lineClamp: 2 }}>
                {goal.title}
              </Typography>
              <DashboardMenu />
            </Stack>

            <Typography
              variant="subtitle2"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column', md: 'row' },
                gap: 0.5,
              }}
            >
              <Box component="span" fontWeight={400} color="text.secondary">
                Created by
              </Box>
              {goal.createdBy.name}
            </Typography>
          </Stack>

          <Stack gap={2} alignItems="center">
            <Box sx={{ width: 1 }}>
              <LinearProgress variant="determinate" value={goal.progress} sx={{ height: 8 }} />
            </Box>
            <Typography variant="h6">{goal.progress}%</Typography>
          </Stack>
          <Stack
            direction={{ xs: 'row', sm: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', sm: 'flex-start', md: 'center' }}
            gap={1}
          >
            <Stack gap={1} flexGrow={1}>
              {goal.tags.map((tag, index) => (
                <Chip key={index} variant="soft" label={tag} color={getTagChipColor(tag)} />
              ))}
            </Stack>
            <Typography variant="caption" fontWeight={500} color="text.secondary">
              Due: {dayjs(goal.dueDate).format('MMM D, YYYY')}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
      <GoalDialog
        goal={goal}
        dialogProps={{
          open,
          onClose: () => setOpen(false),
        }}
      />
    </Fragment>
  );
};

export default GoalCard;
