import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { comments } from 'data/hrm/performance-management';
import CommentForm from './CommentForm';
import CommentThread from './thread';

const TOTAL_COMMENTS = 100;

const CommentSection = () => {
  return (
    <Stack direction="column" gap={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Comments ({TOTAL_COMMENTS})
      </Typography>

      <CommentForm />
      <CommentThread comments={comments} />
    </Stack>
  );
};

export default CommentSection;
