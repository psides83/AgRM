import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
  avatarClasses,
} from '@mui/material';
import { users } from 'data/users';
import IconifyIcon from 'components/base/IconifyIcon';

const meetings = [
  {
    id: 1,
    title: 'Catching up on regular updates',
    date: '11 March, 2023',
    time: '3:30 PM',
    status: {
      label: 'Now',
      active: true,
    },
    joinMeetLink: '#!',
    attendants: [users[3], users[4], users[6], users[10], users[11], users[13]],
  },
  {
    id: 2,
    title: 'Meeting with project lead',
    date: '13 March, 2023',
    time: '9:30 PM',
    status: {
      label: '2 days',
    },
    attendants: [users[2], users[3]],
  },
  {
    id: 3,
    title: 'Discussion with the developers on planning',
    date: '16 March, 2023',
    time: '7:30 PM',
    status: {
      label: '3 days',
    },
    attendants: [users[5], users[7], users[8], users[9]],
  },
  {
    id: 4,
    title: 'Quick idea sharing session.',
    date: '17 March, 2023',
    time: '12:00 PM',
    status: {
      label: '4 days',
    },
    attendants: [users[3], users[1], users[10]],
  },
];

const MeetingCard = () => {
  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        outline: 'none',
        p: 2,
        width: 1,
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <Box sx={{ maxHeight: 265, overflow: 'auto' }}>
        {meetings.map((meeting) => {
          const { id, title, date, time, status, attendants, joinMeetLink } = meeting;

          const formattedDate = date.split(',')[0];
          return (
            <Box
              key={id}
              sx={(theme) => ({
                bgcolor: 'background.elevation1',
                borderRadius: 2,
                p: 2,
                ...(status.active && {
                  bgcolor: `${theme.vars.palette.chOrange[100]} !important`,
                }),
              })}
            >
              <Stack spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1, lineClamp: 2 }}>
                  {title}
                </Typography>

                <Chip
                  variant={status.active ? 'filled' : 'soft'}
                  color={status.active ? 'warning' : 'neutral'}
                  label={status.label}
                />
              </Stack>

              <Typography
                variant="subtitle2"
                sx={{ mb: 3, color: status.active ? 'warning.darker' : 'text.secondary' }}
              >
                {formattedDate} | {time}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
              >
                <AvatarGroup
                  sx={{
                    [`& .${avatarClasses.root}`]: {
                      width: 24,
                      height: 24,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      borderWidth: 1,
                      '&:first-of-type': {
                        backgroundColor: 'primary.main',
                      },
                    },
                  }}
                >
                  {attendants.slice(0, 3).map((attendant) => (
                    <Tooltip key={attendant.name} title={attendant.name}>
                      <Avatar src={attendant.avatar} alt={attendant.name} />
                    </Tooltip>
                  ))}
                </AvatarGroup>
                {joinMeetLink ? (
                  <Button
                    variant={status.active ? 'contained' : 'soft'}
                    startIcon={
                      <IconifyIcon
                        icon="material-symbols:videocam-outline"
                        height={20}
                        width={20}
                      />
                    }
                    href={joinMeetLink}
                  >
                    Join
                  </Button>
                ) : (
                  <Button
                    variant="soft"
                    startIcon={
                      <IconifyIcon icon="material-symbols:alarm-outline" height={20} width={20} />
                    }
                  >
                    Notify Me
                  </Button>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default MeetingCard;
