import { Avatar, Box, Button, Checkbox, Chip, Stack, Typography, styled } from '@mui/material';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import { getStatusChipColor } from '..';

const MemberGridItem = ({ data, sx, ...rest }) => {
  return (
    <GridCardWrapper {...rest} sx={{ ...sx }}>
      <Stack sx={{ mb: 1, justifyContent: 'space-between' }}>
        <Checkbox />
        <DashboardMenu />
      </Stack>
      <Stack direction="column" gap={5}>
        <Stack direction="column" gap={3}>
          <Stack gap={2} sx={{ alignItems: 'center' }}>
            <Avatar src={data.avatar} sx={{ width: 64, height: 64 }} />
            <Stack direction="column" gap={0.5}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {data.idNo}
              </Typography>
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {data.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
                  {data.jobTitle}
                </Typography>
              </div>
            </Stack>
          </Stack>

          <Stack gap={3} sx={{ alignItems: 'center' }}>
            <Chip label={data.status} color={getStatusChipColor(data.status)} />
            <Typography variant="caption">
              <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary', mr: 0.5 }}>
                Team
              </Box>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {data.team}
              </Box>
            </Typography>
          </Stack>
        </Stack>

        <Stack gap={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack gap={0.5}>
            <Button shape="square" size="small" variant="soft" color="neutral">
              <IconifyIcon icon="material-symbols:mail-outline-rounded" sx={{ fontSize: 18 }} />
            </Button>
            <Button shape="square" size="small" variant="soft" color="neutral">
              <IconifyIcon icon="material-symbols:call-outline-rounded" sx={{ fontSize: 18 }} />
            </Button>
            <Button shape="square" size="small" variant="soft" color="neutral">
              <IconifyIcon
                icon="material-symbols:location-on-outline-rounded"
                sx={{ fontSize: 18 }}
              />
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Hired{` `}
            {dayjs(data.hiredDate).format('MMM DD, YYYY')}
          </Typography>
        </Stack>
      </Stack>
    </GridCardWrapper>
  );
};
const GridCardWrapper = styled(Box)(
  ({ theme: { spacing, breakpoints, vars, transitions, shape } }) => ({
    padding: spacing(2),
    display: 'flex',
    flexDirection: 'column',
    borderRadius: Number(shape.borderRadius) * 6,
    backgroundColor: vars.palette.background.elevation1,
    transition: transitions.create(['background-color'], {
      duration: transitions.duration.enteringScreen,
      easing: transitions.easing.easeInOut,
    }),
    '&:hover': {
      backgroundColor: vars.palette.background.elevation2,
      cursor: 'pointer',
    },
    [breakpoints.up('sm')]: { padding: spacing(3) },
  }),
);
export default MemberGridItem;
