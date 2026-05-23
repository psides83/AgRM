import { Box, Chip, Stack, Typography } from '@mui/material';
import { blogDetailsTags } from 'data/content/blog';

const BlogTags = () => {
  return (
    <Box sx={{ mb: { xs: 3, md: 5 } }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.secondary' }}>
        Tags
      </Typography>

      <Stack sx={{ gap: 1, flexWrap: 'wrap' }}>
        {blogDetailsTags.map((tag) => (
          <Chip key={tag.id} label={tag.label} />
        ))}
      </Stack>
    </Box>
  );
};

export default BlogTags;
