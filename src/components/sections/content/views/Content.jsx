'use client';

import { Container, Paper } from '@mui/material';
import ContentMain from 'components/sections/content/homepage/ContentMain';

const Content = () => {
  return (
    <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg" disableGutters>
        <ContentMain />
      </Container>
    </Paper>
  );
};

export default Content;
