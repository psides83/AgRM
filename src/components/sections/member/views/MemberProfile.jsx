'use client';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { useSettingsContext } from 'providers/SettingsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import MemberProfileMain from 'components/sections/member/profile';

const MemberProfile = () => {
  const {
    config: { assetsDir },
  } = useSettingsContext();
  return (
    <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
      <Container maxWidth="md" disableGutters>
        <Box
          component="figure"
          sx={{ m: 0, position: 'relative', height: 200, borderRadius: 6, overflow: 'hidden' }}
        >
          <Image
            src={`${assetsDir}/images/member/1.webp`}
            fill
            loading="eager"
            sx={{ height: 1, width: 1, objectFit: 'cover' }}
          />
          <Button
            shape="square"
            variant="soft"
            color="neutral"
            sx={({ spacing }) => ({ position: 'absolute', top: spacing(3), right: spacing(3) })}
          >
            <IconifyIcon icon="material-symbols:edit-outline" sx={{ fontSize: 18 }} />
          </Button>
        </Box>

        <MemberProfileMain />
      </Container>
    </Paper>
  );
};
export default MemberProfile;
