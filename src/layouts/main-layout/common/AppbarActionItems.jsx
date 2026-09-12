import { Box, Stack } from '@mui/material';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';
import QuickCreateMenu from './QuickCreateMenu';

const AppbarActionItems = ({ type = 'default', sx, searchComponent }) => {
  return (
    <Stack
      className="action-items"
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexShrink: 0,
        ml: 'auto',
        minWidth: 0,
        ...sx,
      }}
    >
      {searchComponent}
      <QuickCreateMenu type={type} />
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <NotificationMenu type={type} />
      </Box>
      <ProfileMenu type={type} />
    </Stack>
  );
};

export default AppbarActionItems;
