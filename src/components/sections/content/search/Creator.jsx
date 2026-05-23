import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';

const Creator = ({ item }) => {
  const { down } = useBreakpoints();
  const downSm = down('sm');
  const [isFollowing, setIsFollowing] = useState(item.isFollowing);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing((prev) => !prev);
  };

  const uploads = [
    { label: 'Blogs', count: item.uploadedCount.blog },
    { label: 'Videos', count: item.uploadedCount.videos },
    { label: 'Podcasts', count: item.uploadedCount.podcasts },
  ].filter((u) => u.count);

  return (
    <ListItem
      sx={{
        gap: { xs: 1.5, sm: 2 },
        alignItems: { xs: 'flex-start', sm: 'center' },
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        cursor: 'pointer',

        '&: hover': {
          bgcolor: 'background.elevation1',
        },
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <ListItemAvatar sx={{ minWidth: 48, mt: { xs: 0.75, sm: 0 } }}>
        <Avatar
          src={item.avatar || undefined}
          alt={item.name}
          sx={{ width: 48, height: 48 }}
          slotProps={{ img: { sx: { objectFit: 'contain' } } }}
        >
          {!item.avatar && item.name.slice(0, 1)}
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        disableTypography
        primary={
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="inherit"
            component={Link}
            href="#!"
            sx={{ mb: 0.5, display: 'inline-block' }}
          >
            {item.name}
          </Typography>
        }
        secondary={
          <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap="wrap">
            {uploads.map(({ label, count }) => (
              <Typography key={label} variant="caption" color="text.secondary">
                <Box component="strong">{count} </Box>
                {label}
              </Typography>
            ))}
          </Stack>
        }
      />

      <Button
        variant={isFollowing ? 'soft' : 'contained'}
        color="neutral"
        onClick={handleClick}
        shape={downSm ? 'square' : undefined}
        sx={{ flexShrink: 0, ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 } }}
      >
        <IconifyIcon
          icon={
            isFollowing
              ? 'material-symbols:person-check-outline-rounded'
              : 'material-symbols:person-add-outline-rounded'
          }
          sx={{ fontSize: 20, display: { xs: 'block', sm: 'none' } }}
        />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {isFollowing ? 'Following' : 'Follow'}
        </Box>
      </Button>
    </ListItem>
  );
};

export default Creator;
