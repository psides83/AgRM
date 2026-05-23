import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';

const DetailsSection = ({ goal }) => {
  return (
    <Stack direction="column" gap={3}>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineClamp: 5 }}>
        {goal.description}
      </Typography>

      <Grid container spacing={2}>
        <Grid size="grow">
          <CaptionTypography>Created by</CaptionTypography>
          <Stack gap={0.5} sx={{ alignItems: 'center' }}>
            <Avatar src={goal.createdBy.avatar} sx={{ width: 24, height: 24 }} />
            <Typography variant="subtitle2">{goal.createdBy.name}</Typography>
          </Stack>
        </Grid>
        <Grid container size={{ xs: 12, sm: 5 }}>
          <Grid size={6}>
            <CaptionTypography>Created Date</CaptionTypography>
            <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>
              {dayjs(goal.createdDate).format('MMM D, YYYY')}
            </Typography>
          </Grid>
          <Grid size={6}>
            <CaptionTypography>Due Date</CaptionTypography>
            <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>
              {dayjs(goal.dueDate).format('MMM D, YYYY')}
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Stack gap={2} alignItems="center">
        <Box sx={{ width: 1 }}>
          <LinearProgress variant="determinate" value={goal.progress} sx={{ height: 8 }} />
        </Box>
        <Typography variant="h6">{goal.progress}%</Typography>
      </Stack>

      <Stack direction="column" gap={3}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Subgoals
        </Typography>
        <FormGroup>
          {goal.subGoals.map((subGoal, index) => (
            <FormControlLabel
              key={index}
              control={<Checkbox defaultChecked={index === 0} />}
              label={subGoal}
            />
          ))}
        </FormGroup>
      </Stack>
    </Stack>
  );
};

export default DetailsSection;

const CaptionTypography = styled((props) => <Typography variant="caption" {...props} />)(
  ({ theme }) => ({
    fontWeight: 500,
    display: 'block',
    color: theme.vars.palette.text.secondary,
    marginBottom: theme.spacing(1),
    textWrap: 'nowrap',
  }),
);
