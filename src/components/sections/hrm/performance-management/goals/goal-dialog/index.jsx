import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DetailsSection from './DetailsSection';
import TitleSection from './TitleSection';
import CommentSection from './comments';

const GoalDialog = ({ goal, dialogProps }) => {
  const { sx, onClose } = dialogProps;
  return (
    <Dialog
      {...dialogProps}
      scroll="body"
      maxWidth={false}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: 'visible',
          maxWidth: 600,
          ...sx,
        },
      }}
    >
      {/* Title */}
      <TitleSection goal={goal} onClose={onClose} />

      <DialogContent sx={{ p: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Details */}
        <DetailsSection goal={goal} />

        {/* Comments */}
        <CommentSection />
      </DialogContent>
    </Dialog>
  );
};

export default GoalDialog;
