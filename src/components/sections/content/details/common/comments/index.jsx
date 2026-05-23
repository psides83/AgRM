import { useState } from 'react';
import { Box, Button, Drawer, Stack, Typography, drawerClasses } from '@mui/material';
import { comments } from 'data/content/homepage';
import useNumberFormat from 'hooks/useNumberFormat';
import IconifyIcon from 'components/base/IconifyIcon';
import CommentForm from './CommentForm';
import CommentThread from './thread';

const TOTAL_COMMENTS = 100;

const ContentComments = ({ isDrawer = false }) => {
  const [open, setOpen] = useState(false);
  const { numberFormat } = useNumberFormat();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const commentsContent = (
    <>
      <Stack sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" id="comments">
          Comments({TOTAL_COMMENTS})
        </Typography>

        {isDrawer && (
          <Button color="neutral" shape="circle" onClick={() => setOpen(false)}>
            <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 24 }} />
          </Button>
        )}
      </Stack>

      <CommentForm />
      <CommentThread comments={comments} />
    </>
  );

  if (!isDrawer) {
    return <Box>{commentsContent}</Box>;
  }

  return (
    <div>
      <Button color="neutral" onClick={toggleDrawer(true)}>
        <IconifyIcon
          icon="material-symbols:mode-comment-outline-rounded"
          sx={{ fontSize: 16, mr: 0.5 }}
        />
        {numberFormat(34, {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1,
        })}
      </Button>

      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor="right"
        sx={{
          [`& .${drawerClasses.paper}`]: {
            width: { xs: 1, md: 480 },
            overflowX: 'hidden',
            p: 5,
          },
        }}
      >
        {commentsContent}
      </Drawer>
    </div>
  );
};

export default ContentComments;
