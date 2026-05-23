import { useState } from 'react';
import { Avatar, Box, Button, Chip, Grid, Link, Stack, Typography } from '@mui/material';
import { users } from 'data/users';
import dayjs from 'dayjs';
import useNumberFormat from 'hooks/useNumberFormat';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import BookmarkButton from 'components/sections/content/common/BookmarkButton';
import ContentComments from '../../common/comments';

const BlogHeader = () => {
  const [isLiked, setIsLiked] = useState(false);
  const { numberFormat } = useNumberFormat();

  const handleReaction = () => {
    setIsLiked((prev) => !prev);
  };

  return (
    <Box sx={{ mb: { xs: 3, md: 5 } }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Architecture Through the Ages: From Ancient Masterpieces to Modern Icons
      </Typography>

      <Stack sx={{ gap: 2, alignItems: 'center', mb: 3 }}>
        <Chip size="small" label="Science" />

        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          12 min read
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {dayjs('2024-12-31').format('DD MMM,YYYY')}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 'auto' }}>
          <Stack sx={{ gap: 1, alignItems: 'center' }}>
            <Avatar src={users[12].avatar} alt="avatar" sx={{ width: 32, height: 32 }} />
            <Typography
              component={Link}
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: 'text.primary' }}
            >
              Tsamina Mina
            </Typography>
          </Stack>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 'auto' }}
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Stack sx={{ gap: 1, alignItems: 'center' }}>
            <Button color="neutral" onClick={handleReaction}>
              <IconifyIcon
                icon={
                  isLiked
                    ? `material-symbols:thumb-up-rounded`
                    : `material-symbols:thumb-up-outline-rounded`
                }
                sx={{ fontSize: 16, mr: 0.5 }}
              />

              {numberFormat(14200, {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1,
              })}
            </Button>

            <ContentComments isDrawer />
          </Stack>

          <Stack sx={{ gap: 1, alignItems: 'center' }}>
            <Button color="neutral" shape="square">
              <IconifyIcon icon="material-symbols:share-outline" sx={{ fontSize: 16 }} />
            </Button>

            <BookmarkButton />

            <DashboardMenu sx={{ minWidth: 36, minHeight: 36 }} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BlogHeader;
