import Grid from '@mui/material/Grid';
import GoalCard from './GoalCard';

const GoalsGrid = ({ goals, ...rest }) => {
  return (
    <Grid container spacing={2} {...rest}>
      {goals.map((goal) => (
        <Grid key={goal.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <GoalCard goal={goal} />
        </Grid>
      ))}
    </Grid>
  );
};

export default GoalsGrid;
