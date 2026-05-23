import { Collapse, Paper, Stack } from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import ControlButton from './components/ControlButton';
import PlayerActions from './components/PlayerActions';
import PlayerControls from './components/PlayerControls';
import PlayerInfo from './components/PlayerInfo';
import PlayerOptions from './components/PlayerOptions';
import PlayerProgress from './components/PlayerProgress';

const PodcastPlayer = ({ isExpanded, togglePlayer }) => {
  const { up } = useBreakpoints();

  const upSm = up('sm');

  return (
    <Paper
      background={2}
      sx={{
        px: { xs: 3, md: 5 },
        py: 2,
        width: 1,
      }}
    >
      <Stack direction="column" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
        <Collapse in={!isExpanded}>
          <PlayerInfo sx={{ width: 1, flexShrink: 0 }} />
        </Collapse>

        <Stack direction={{ xs: 'column' }} width={1} flex={1} gap={1}>
          <PlayerProgress />

          <Stack alignItems="center" justifyContent="space-between">
            {upSm ? (
              <PlayerActions sx={{ xs: 144, md: 200 }} />
            ) : (
              <ControlButton icon="material-symbols:volume-off-outline-rounded" />
            )}

            <PlayerControls />

            {upSm ? (
              <PlayerOptions
                isExpanded={isExpanded}
                togglePlayer={togglePlayer}
                sx={{ xs: 144, md: 200 }}
              />
            ) : (
              <ControlButton
                icon={`material-symbols:${isExpanded ? 'collapse' : 'expand'}-content-rounded`}
                onClick={togglePlayer}
              />
            )}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PodcastPlayer;
