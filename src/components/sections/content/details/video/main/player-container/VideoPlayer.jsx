import { useSettingsContext } from 'providers/SettingsProvider';
import Video from 'components/base/Video';

const VideoPlayer = () => {
  const {
    config: { assetsDir },
  } = useSettingsContext();

  return (
    <Video
      controls
      src={`${assetsDir}/videos/file-manager/aurora.mp4`}
      sx={{
        borderRadius: 4,
        width: 1,
        aspectRatio: '16/9',
        mb: 4,
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
};

export default VideoPlayer;
