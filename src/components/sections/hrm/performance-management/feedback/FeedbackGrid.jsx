import Grid from '@mui/material/Grid';
import FeedbackCard from './FeedbackCard';

const FeedbackGrid = ({ feedbacks }) => {
  return (
    <Grid container spacing={2}>
      {feedbacks.map((feedback) => (
        <Grid key={feedback.id} size={{ xs: 12, sm: 6 }}>
          <FeedbackCard feedback={feedback} />
        </Grid>
      ))}
    </Grid>
  );
};

export default FeedbackGrid;
