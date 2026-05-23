import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Avatar,
  Button,
  Checkbox,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { podcastPlaylist } from 'data/content/podcast';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import AddNewDialog from './AddNewDialog';

export default function PodcastPlaylist() {
  const [podcasts] = useState(podcastPlaylist);
  const [searchQuery, setSearchQuery] = useState('');

  const { setValue, watch } = useFormContext();
  const selectedPlaylistIds = watch('podcastPlaylistIds') || [];

  const handleToggle = (playlistId) => () => {
    const currentIndex = selectedPlaylistIds.indexOf(playlistId);
    const newSelected = [...selectedPlaylistIds];

    if (currentIndex === -1) {
      newSelected.push(playlistId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setValue('podcastPlaylistIds', newSelected, {
      shouldValidate: true,
    });
  };

  const filteredPodcasts = podcasts.filter((podcast) =>
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Paper variant="elevation" elevation={0} background={1} sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        Podcast/Playlist
      </Typography>

      <StyledTextField
        fullWidth
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="material-symbols:search-rounded" fontSize={16} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <List dense sx={{ py: 0, maxHeight: 220, mb: 3, overflowX: 'hidden' }}>
        {filteredPodcasts.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <Button
                shape="square"
                color="neutral"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit action here
                }}
              >
                <IconifyIcon icon="material-symbols:edit-outline-rounded" sx={{ fontSize: 18 }} />
              </Button>
            }
            disablePadding
            sx={{ gap: 1 }}
          >
            <ListItemButton
              role={undefined}
              onClick={handleToggle(item.id)}
              dense
              sx={{ gap: 1, alignItems: 'center' }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedPlaylistIds.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>

              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar variant="rounded" src={item.image} sx={{ width: 44, height: 44 }} />
              </ListItemAvatar>

              <ListItemText
                primary={item.title}
                sx={{ ml: 1 }}
                slotProps={{
                  primary: {
                    variant: 'body2',
                    color: 'textSecondary',
                    sx: {
                      lineClamp: 1,
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <AddNewDialog />
    </Paper>
  );
}
