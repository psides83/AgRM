import { Box, Stack } from '@mui/material';
import Accessibility from '../common/form-fields/Accessibility';
import Language from '../common/form-fields/Language';
import TargetAudience from '../common/form-fields/TargetAudience';
import Topics from '../common/form-fields/Topics';
import BasicInfo from './form-fields/BasicInfo';
import PodcastPlaylistMeta from './form-fields/PodcastPlaylistMeta';
import Tags from './form-fields/Tags';
import Thumbnail from './form-fields/Thumbnail';
import Transcript from './form-fields/Transcript';
import MediaUpload from './form-fields/media-upload';
import PodcastPlaylist from './form-fields/podcast-playlist';

const UploadMediaMain = () => {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} gap={3} sx={{ mb: 4 }}>
      <Box sx={{ width: 1, maxWidth: { xs: 1, md: 320, lg: 368 }, flexShrink: 0 }}>
        <MediaUpload />
      </Box>

      <Stack direction="column" gap={3}>
        <Thumbnail />
        <BasicInfo />
        <PodcastPlaylist />
        <Topics />
        <PodcastPlaylistMeta />
        <Tags />
        <Stack gap={1}>
          <Accessibility />
          <Language />
        </Stack>
        <Transcript />
        <TargetAudience />
      </Stack>
    </Stack>
  );
};

export default UploadMediaMain;
