import {
  Avatar,
  Button,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { users } from 'data/users';

const BlogAuthor = () => {
  return (
    <Paper
      variant="elevation"
      background={1}
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        mb: { xs: 3, md: 5 },
      }}
    >
      <List sx={{ py: 0, mb: 2 }}>
        <ListItem sx={{ alignItems: 'center', gap: 1, p: 0 }}>
          <ListItemAvatar sx={{ minWidth: 64 }}>
            <Avatar src={users[12].avatar} alt="avatar" sx={{ width: 64, height: 64 }} />
          </ListItemAvatar>

          <ListItemText
            primary={
              <Stack direction="column" gap={1}>
                <Typography
                  component={Link}
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ color: 'text.primary' }}
                >
                  Tsamina Mina
                </Typography>
                <Stack gap={{ xs: 1, sm: 2 }} sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Typography variant="caption" fontWeight={500} sx={{ color: 'text.secondary' }}>
                    20 Stories
                  </Typography>
                  <Typography variant="caption" fontWeight={500} sx={{ color: 'text.secondary' }}>
                    5 Topics
                  </Typography>
                  <Typography variant="caption" fontWeight={500} sx={{ color: 'text.secondary' }}>
                    100 Followers
                  </Typography>
                </Stack>
              </Stack>
            }
            sx={{
              display: 'flex',
              gap: 2.5,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              my: 0,
            }}
          />
          <Button variant="soft" color="primary">
            Follow
          </Button>
        </ListItem>
      </List>

      <Typography sx={{ color: 'text.secondary' }}>
        Hi, I'm an architect and writer passionate about exploring the intersection of design,
        culture, and human experience. With years of practice in architectural design and a deep
        love for storytelling, I aim to translate complex architectural ideas into engaging and
        thought-provoking narratives.
      </Typography>
    </Paper>
  );
};

export default BlogAuthor;
