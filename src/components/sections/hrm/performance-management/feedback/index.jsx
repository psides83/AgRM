import { useMemo, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { feedbacks } from 'data/hrm/performance-management';
import CustomPagination from 'components/common/CustomPagination';
import FeedbackGrid from './FeedbackGrid';
import FeedbackTabs from './FeedbackTabs';

const HRMFeedbackMain = () => {
  const [tab, setTab] = useState('Received');

  const handleChange = (_, value) => setTab(value);

  const filteredFeedbacks = useMemo(
    () => feedbacks.filter((feedback) => feedback.assessment === tab),
    [tab],
  );

  return (
    <Fragment>
      <FeedbackTabs value={tab} onChange={handleChange} />
      <Box
        sx={{
          pt: 3,
          pb: { xs: 3, md: 5 },
          px: { xs: 3, md: 5 },
        }}
      >
        <Grid container spacing={4}>
          <Grid size={12}>
            <FeedbackGrid feedbacks={filteredFeedbacks} />
          </Grid>
          <Grid size={12}>
            <CustomPagination count={filteredFeedbacks.length} />
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default HRMFeedbackMain;
