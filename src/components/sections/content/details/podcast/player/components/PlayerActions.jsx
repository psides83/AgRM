import { Stack } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';
import ControlButton from './ControlButton';

const PlayerActions = ({ sx }) => {
  const { up } = useBreakpoints();
  const upMd = up('md');
  return (
    <Stack sx={{ gap: 1, alignItems: 'center', ...sx }}>
      <ControlButton icon="material-symbols:thumb-up-outline-rounded">
        {upMd && '14.2k'}
      </ControlButton>

      <ControlButton icon="material-symbols:share-outline" />

      <BookmarkButton variant="text" size="small" />

      <DashboardMenu size="small" variant="text" sx={{ fontSize: 18 }} />
    </Stack>
  );
};

export default PlayerActions;
