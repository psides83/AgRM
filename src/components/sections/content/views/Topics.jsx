'use client';

import { useState } from 'react';
import { Container, inputBaseClasses, Stack, Typography } from '@mui/material';
import SearchTextField from 'components/common/SearchTextField';
import TopicsContainer from 'components/sections/content/topics';

const ContentTopics = () => {
  const [query, setQuery] = useState('');

  return (
    <Container
      maxWidth="md"
      sx={{
        p: { xs: 3, md: 5 },
      }}
    >
      <Stack
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          mb: { xs: 3, sm: 5 },
        }}
      >
        <Typography variant="h4">Topic</Typography>

        <SearchTextField
          fullWidth
          size="large"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          iconSx={{ fontSize: 16 }}
          sx={{
            maxWidth: 400,
            flexGrow: { xs: 1, sm: 0 },
            [`& .${inputBaseClasses.root}`]: { pl: 2 },
          }}
        />
      </Stack>

      <TopicsContainer searchQuery={query} />
    </Container>
  );
};

export default ContentTopics;
