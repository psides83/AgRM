import { Box, Typography } from '@mui/material';
import Image from 'components/base/Image';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const VIDEO_EXTS = ['mp4', 'mkv', 'mov', 'avi', 'mpg'];
const AUDIO_EXTS = ['mp3', 'wav', 'm4a', 'ogg'];

const InlineMediaPreview = ({ preview }) => {
  const ext = preview?.format?.toLowerCase() || '';
  const previewUrl = preview?.preview;

  if (!previewUrl && !ext) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No preview available
      </Typography>
    );
  }

  if (IMAGE_EXTS.includes(ext) && previewUrl) {
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image src={previewUrl} alt="File preview" fill sx={{ objectFit: 'cover' }} />
      </Box>
    );
  }

  if (VIDEO_EXTS.includes(ext) && previewUrl) {
    return (
      <video
        src={previewUrl}
        controls
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
    );
  }

  if (AUDIO_EXTS.includes(ext) && previewUrl) {
    return <audio src={previewUrl} controls style={{ width: '100%' }} />;
  }

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      No preview available for {ext ? `.${ext}` : 'this file'}
    </Typography>
  );
};

export default InlineMediaPreview;
