'use client';

import { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import { Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab, { tabClasses } from '@mui/material/Tab';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import { useCrmNotifications } from 'components/sections/crm/shared/useCrmNotifications';
import NotificationTabPanel from 'components/sections/notification/NotificationTabPanel';

const Notifications = () => {
  const [currentTab, setCurrentTab] = useState('all');
  const { notifications } = useCrmNotifications();

  const { up } = useBreakpoints();

  const upSm = up('sm');

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        p: { xs: 3, md: 5 },
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="#!">Pages</Link>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          Notifications
        </Typography>
      </Breadcrumbs>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
        }}
      >
        Notifications
      </Typography>
      <TabContext value={currentTab}>
        <Stack
          sx={{
            justifyContent: 'space-between',
          }}
        >
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab
              label={upSm ? 'All notifications' : undefined}
              value="all"
              icon={
                <IconifyIcon icon="material-symbols:notifications-outline-rounded" fontSize={20} />
              }
              iconPosition="start"
              sx={{
                [`& .${tabClasses.icon}`]: {
                  mr: 0.5,
                },
              }}
            />
            <Tab
              label={upSm ? 'Equipment' : undefined}
              value="equipment"
              icon={
                <IconifyIcon icon="material-symbols:warning-outline-rounded" fontSize={20} />
              }
              iconPosition="start"
            />
          </TabList>

          <Button
            variant="soft"
            color="neutral"
            startIcon={<IconifyIcon icon="material-symbols:check-rounded" />}
          >
            Mark all as read
          </Button>
        </Stack>
        <NotificationTabPanel value="all" notificationsData={notifications} />
        <NotificationTabPanel
          value="equipment"
          notificationsData={notifications.filter(
            (notification) => notification.type === 'crm_equipment',
          )}
        />
      </TabContext>
    </Box>
  );
};

export default Notifications;
