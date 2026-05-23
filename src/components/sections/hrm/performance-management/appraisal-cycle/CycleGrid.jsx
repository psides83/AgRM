import Grid from '@mui/material/Grid';
import AppraisalCycleCard from './CycleCard';

const AppraisalCycleGrid = ({ cycles }) => {
  return (
    <Grid container spacing={2}>
      {cycles.map((cycle) => (
        <Grid key={cycle.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <AppraisalCycleCard {...cycle} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AppraisalCycleGrid;
