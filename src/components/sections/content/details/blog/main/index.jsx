import { Divider } from '@mui/material';
import BlogAuthor from './BlogAuthor';
import BlogHeader from './BlogHeader';
import BlogStory from './BlogStory';
import BlogTags from './BlogTags';
import BlogsFromCreator from './BlogsFromCreator';

const BlogDetailsMain = () => {
  return (
    <div>
      <BlogHeader />

      <BlogStory />

      <BlogTags />

      <Divider sx={{ mb: { xs: 3, md: 5 } }} />

      <BlogAuthor />

      <Divider sx={{ mb: { xs: 3, md: 5 } }} />

      <BlogsFromCreator />
    </div>
  );
};

export default BlogDetailsMain;
