import { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import ReplyThread from './ReplyThread';
import ThreadConnector from './ThreadConnector';
import ThreadInput from './ThreadInput';
import ContentBlock from './content-block';

const CommentThread = ({ comments }) => {
  return (
    <>
      <Box sx={{ position: 'relative' }}>
        {comments.map((comment, i) => {
          const isLast = i === comments.length - 1;
          return <CommentItem key={comment.id} comment={comment} isLast={isLast} />;
        })}
      </Box>
    </>
  );
};

const CommentItem = ({ comment, isLast }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const toggleReply = () => setShowReplyInput((prev) => !prev);

  return (
    <div>
      <Box sx={{ position: 'relative' }}>
        {comment.replies.length > 0 && (
          <>
            {((comment.replies && comment.replies.length > 0) || showReplyInput) && (
              <ThreadConnector offsetLeft={16} sx={{ height: 'calc(100% - 56px)', bottom: 0 }} />
            )}
          </>
        )}
        <ContentBlock content={comment} toggleThreadInput={toggleReply} />
      </Box>

      <Collapse in={showReplyInput} mountOnEnter unmountOnExit>
        <Box sx={{ position: 'relative', pl: 5 }}>
          {comment.replies.length > 0 && <ThreadConnector offsetLeft={16} />}
          <ThreadInput placeholder="Reply to this comment..." toggleThreadInput={toggleReply} />
        </Box>
      </Collapse>

      <ReplyThread
        replies={comment.replies ?? []}
        isLastComment={isLast}
        toggleThreadInput={toggleReply}
      />
    </div>
  );
};

export default CommentThread;
