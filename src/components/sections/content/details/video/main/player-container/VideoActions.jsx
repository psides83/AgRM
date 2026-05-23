import { Button, Stack } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';

const VideoActions = () => {
  const { up } = useBreakpoints();

  const upSm = up('sm');

  return (
    <Stack gap={{ xs: 1, sm: 2 }} justifyContent="space-between" width={{ xs: 1, lg: 'unset' }}>
      <Stack sx={{ gap: 1, alignItems: 'center' }}>
        <Button variant="soft" color="neutral">
          <IconifyIcon
            icon={`material-symbols:thumb-up-outline-rounded`}
            sx={{ fontSize: 20, mr: 0.5 }}
          />
          14.2k
        </Button>
        <Button variant="soft" color="neutral">
          <IconifyIcon
            icon="material-symbols:mode-comment-outline-rounded"
            sx={{ fontSize: 18, mr: 0.5 }}
          />{' '}
          34
        </Button>
      </Stack>

      <Stack sx={{ gap: 1, alignItems: 'center' }}>
        <Button variant="soft" color="neutral" shape="square">
          <IconifyIcon icon="material-symbols:share-outline" sx={{ fontSize: 20 }} />
        </Button>
        <BookmarkButton variant="soft" />
        {upSm && (
          <Button variant="soft" color="neutral" shape="square">
            <IconifyIcon icon="material-symbols:playlist-play-rounded" sx={{ fontSize: 20 }} />
          </Button>
        )}
        <DashboardMenu size="medium" variant="soft" sx={{ fontSize: 20 }} />
      </Stack>
    </Stack>
  );
};

export default VideoActions;
