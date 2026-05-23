'use client';

import { Container, Paper } from '@mui/material';
import SearchContainer from 'components/sections/content/search';

const Search = () => {
  return (
    <Paper sx={{ height: 1 }}>
      <Container maxWidth="md" sx={{ p: { xs: 3, md: 5 } }}>
        <SearchContainer />
      </Container>
    </Paper>
  );
};

export default Search;
