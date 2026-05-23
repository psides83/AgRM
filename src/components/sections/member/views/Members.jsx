'use client';

import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import MemberListMain from 'components/sections/member/member-list';
import FilterDrawer from 'components/sections/member/member-list/filter-drawer';

const filterDrawerWidth = 280;

const Members = () => {
  const { up } = useBreakpoints();
  const { topbarHeight } = useNavContext();
  const upXl = up('xl');
  const upSm = up('sm');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  useEffect(() => setIsDrawerOpen(false), [upXl]);
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        height: theme.mixins.contentHeight(
          topbarHeight,
          (upSm ? theme.mixins.footer.sm : theme.mixins.footer.xs) + 1,
        ),
      })}
    >
      <FilterDrawer open={isDrawerOpen} handleClose={closeDrawer} drawerWidth={filterDrawerWidth} />
      <Box
        sx={({ transitions }) => ({
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          marginLeft: { xl: `-${filterDrawerWidth}px` },
          transition: transitions.create('margin', {
            easing: transitions.easing.sharp,
            duration: transitions.duration.leavingScreen,
          }),
          ...(isDrawerOpen && {
            transition: transitions.create('margin', {
              easing: transitions.easing.easeOut,
              duration: transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
          }),
        })}
      >
        <PageHeader
          title="Member"
          breadcrumb={[
            { label: 'Home', url: '#!' },
            { label: 'Members', active: true },
          ]}
          paperProps={{ sx: { outline: 0 } }}
          actionComponent={
            <Button
              href={paths.memberNewMember}
              variant="contained"
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            >
              New member
            </Button>
          }
          sx={{ alignItems: 'flex-start' }}
        />

        <MemberListMain toggleDrawer={toggleDrawer} isDrawerOpen={isDrawerOpen} />
      </Box>
    </Box>
  );
};

export default Members;
