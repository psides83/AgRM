import { Grid } from '@mui/material';
import BlogInfo from './info';
import StoryPreview from './story/preview/StoryPreview';

const CreateBlogMain = ({ handleEditStory }) => {
  return (
    <Grid container columnSpacing={3} rowSpacing={5} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <StoryPreview handleEditStory={handleEditStory} />
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <BlogInfo />
      </Grid>
    </Grid>
  );
};

export default CreateBlogMain;
