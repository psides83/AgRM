import { useState } from 'react';
import {
  Avatar,
  Button,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { users } from 'data/users';
import useNumberFormat from 'hooks/useNumberFormat';

const ChannelInfo = () => {
  const { numberFormat } = useNumberFormat();
  const [following, setFollowing] = useState(false);

  return (
    <List disablePadding sx={{ mb: 3, width: 'fit-content' }}>
      <ListItem sx={{ alignItems: 'center', gap: 1, p: 0 }}>
        <ListItemAvatar sx={{ minWidth: 48 }}>
          <Avatar src={users[0].avatar} alt="avatar" sx={{ width: 48, height: 48 }} />
        </ListItemAvatar>

        <ListItemText
          disableTypography
          primary={
            <Link
              href="#!"
              variant="subtitle1"
              sx={{ fontWeight: 'bold', mb: 0.5, width: 'fit-content', color: 'inherit' }}
            >
              {users[0].name}
            </Link>
          }
          secondary={
            <Stack sx={{ gap: 1, alignItems: 'center' }}>
              <Typography
                variant="caption"
                component="p"
                sx={{ fontWeight: 'medium', color: 'text.secondary', whiteSpace: 'nowrap' }}
              >
                {numberFormat(20, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}{' '}
                Stories
              </Typography>
              <Typography
                variant="caption"
                component="p"
                sx={{ fontWeight: 'medium', color: 'text.secondary', whiteSpace: 'nowrap' }}
              >
                {/* {numberFormat(
                      following
                        ? videoItem.uploaderInfo.followers + 1
                        : videoItem.uploaderInfo.followers,
                      {
                        notation: 'compact',
                        compactDisplay: 'short',
                      },
                    )}{' '} */}
                100 Followers
              </Typography>
            </Stack>
          }
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // gap: 3,
            // alignItems: { sm: 'center' },
            my: 0,
          }}
        />
        <Button
          variant="soft"
          color="primary"
          onClick={() => setFollowing(!following)}
          sx={{ ml: 3 }}
        >
          {following ? 'Following' : 'Follow'}
        </Button>
      </ListItem>
    </List>
  );
};

export default ChannelInfo;
