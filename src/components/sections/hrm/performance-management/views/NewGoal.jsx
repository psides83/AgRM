'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CreateNewGoalForm from 'components/sections/hrm/performance-management/new-goal';

const NewGoal = () => {
  return (
    <Box sx={{ p: { xs: 3, md: 5 }, height: 1 }}>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Create New Goals
        </Typography>

        <CreateNewGoalForm />
      </Container>
    </Box>
  );
};

export default NewGoal;
