import { Avatar, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';

const TeamMembers = ({ members }) => {
  return (
    <Stack direction="column" gap={0.5}>
      {members.map((member) => (
        <Stack key={member.id} gap={2} sx={{ py: 2, alignItems: 'center' }}>
          <Avatar src={member.avatar} sx={{ width: 48, height: 48 }} />
          <Stack direction="column" gap={0.5} sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {member.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {member.designation}
            </Typography>
          </Stack>

          <DashboardMenu
            size="medium"
            icon={<IconifyIcon icon="material-symbols:more-vert" />}
            sx={{ fontSize: 20 }}
          />
        </Stack>
      ))}
    </Stack>
  );
};
export default TeamMembers;
