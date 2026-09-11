'use client';

import { useEffect, useState } from 'react';
import { badgeClasses, Box, Button, Link, paperClasses, Popover, Stack } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import {
  groupNotificationsByDate,
  useCrmNotifications,
} from 'components/sections/crm/shared/useCrmNotifications';
import NotificationList from 'components/sections/notification/NotificationList';
import OutlinedBadge from 'components/styled/OutlinedBadge';

const NotificationMenu = ({ type = 'default' }) => {
  const [notifications, setNotifications] = useState({
    today: [],
    older: [],
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications: notificationsData } = useCrmNotifications();

  const {
    config: { textDirection },
  } = useSettingsContext();

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setNotifications(groupNotificationsByDate(notificationsData));
  }, [notificationsData]);

  const unreadCount = notificationsData.length;

  return (
    <>
      <Button
        color="neutral"
        variant={type === 'default' ? 'soft' : 'text'}
        shape="circle"
        size={type === 'slim' ? 'small' : 'medium'}
        onClick={handleClick}
      >
        <OutlinedBadge
          variant={unreadCount ? 'dot' : 'standard'}
          color="error"
          sx={{
            [`& .${badgeClasses.badge}`]: {
              height: 10,
              width: 10,
              top: -2,
              right: -2,
              borderRadius: '50%',
            },
          }}
        >
          <IconifyIcon
            icon={
              type === 'slim'
                ? 'material-symbols:notifications-outline-rounded'
                : 'material-symbols-light:notifications-outline-rounded'
            }
            sx={{ fontSize: type === 'slim' ? 18 : 22 }}
          />
        </OutlinedBadge>
      </Button>
      <Popover
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'bottom',
        }}
        sx={{
          [`& .${paperClasses.root}`]: {
            width: 400,
            height: 650,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ pt: 2, flex: 1, overflow: 'hidden' }}>
          <SimpleBar disableHorizontal>
            <NotificationList
              title="Today"
              notifications={notifications.today}
              variant="small"
              onItemClick={handleClose}
            />
            <NotificationList
              title="Older"
              notifications={notifications.older}
              variant="small"
              onItemClick={handleClose}
            />
          </SimpleBar>
        </Box>
        <Stack
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            py: 1,
          }}
        >
          <Button
            component={Link}
            underline="none"
            href={paths.notifications}
            variant="text"
            color="primary"
          >
            Load more notifications
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default NotificationMenu;
