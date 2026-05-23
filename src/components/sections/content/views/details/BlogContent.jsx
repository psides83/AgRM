'use client';

import { Container, Grid } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import BlogAside from 'components/sections/content/details/blog/BlogAside';
import BlogDetailsMain from 'components/sections/content/details/blog/main';
import RecommendedBlogs from 'components/sections/content/details/blog/recommendations';

const BlogContent = () => {
  const { up } = useBreakpoints();
  const showAside = up('lg');

  return (
    <Grid container>
      <Grid size={12}>
        <Container maxWidth="lg" sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 9 }}>
              <BlogDetailsMain />
            </Grid>

            {showAside && (
              <Grid size={3}>
                <BlogAside />
              </Grid>
            )}
          </Grid>
        </Container>
      </Grid>

      <Grid size={12}>
        <RecommendedBlogs />
      </Grid>
    </Grid>
  );
};

export default BlogContent;
