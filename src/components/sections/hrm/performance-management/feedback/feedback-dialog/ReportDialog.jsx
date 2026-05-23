import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import FinalAssessment from './FinalAssessment';
import Questions from './Questions';
import RatingCard from './RatingCard';
import ReportInfo from './ReportInfo';

const ReportDialog = ({ feedback, onClose, sx, ...rest }) => {
  return (
    <Dialog
      scroll="body"
      maxWidth={false}
      onClose={onClose}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: 'visible',
          maxWidth: 600,
          width: { md: 1 },
          ...sx,
        },
      }}
      {...rest}
    >
      <DialogTitle component={Box} sx={{ p: { xs: 3, md: 5 } }}>
        <Stack gap={1} sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack gap={2} sx={{ alignItems: 'center' }}>
            <Avatar src={feedback.user.avatar} sx={{ width: 56, height: 56 }} />
            <Stack direction="column" gap={0.5}>
              <Typography variant="h6">{feedback.user.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {`${feedback.user.empId}  ${feedback.user.designation}`}
              </Typography>
            </Stack>
          </Stack>
          <Button shape="circle" onClick={onClose} size="small" color="neutral">
            <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 18 }} />
          </Button>
        </Stack>

        <Stack gap={1} sx={{ mb: 1, justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Appraisal Type
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {feedback.appraisalType}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Submitted
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {dayjs(feedback.date).format('MMM D, YYYY')}
            </Typography>
          </Box>
        </Stack>

        <RatingCard
          title="Average Rating"
          value={feedback.rating}
          paperProps={{
            background: 2,
          }}
          typographyProps={{
            variant: 'subtitle1',
            fontWeight: 700,
          }}
          ratingProps={{
            size: 'medium',
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 4, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" gap={3}>
          <ReportInfo
            title="Communication"
            ratingList={[
              {
                label: 'Clarity',
                rating: 5,
              },
              {
                label: 'Listening',
                rating: 5,
              },
              {
                label: 'Speaking',
                rating: 5,
              },
            ]}
            comment="Demonstrates clear and concise communication across all levels, ensuring information is understood and effectively conveyed within the team."
          />

          <ReportInfo
            title="Teamwork"
            ratingList={[
              {
                label: 'Cooperation',
                rating: 5,
              },
              {
                label: 'Supportiveness',
                rating: 5,
              },
              {
                label: 'Conflict Resolution',
                rating: 5,
              },
              {
                label: 'Respect for Others',
                rating: 5,
              },
            ]}
            comment="Actively contributes to team goals by collaborating well with others, showing a strong sense of responsibility and mutual support."
          />

          <ReportInfo
            title="Problem Solving"
            ratingList={[
              {
                label: 'Analytical Thinking',
                rating: 5,
              },
              {
                label: 'Decision Making',
                rating: 5,
              },
              {
                label: 'Creativity',
                rating: 5,
              },
            ]}
          />

          <Questions
            questions={[
              {
                question: 'How does the employee handle communication challenges?',
                answer:
                  'Communicates clearly, listens well, and resolves misunderstandings quickly to keep the team aligned.',
              },
              {
                question: 'How does the employee demonstrated teamwork?',
                answer:
                  'Collaborated effectively during a key project, helping the team meet deadlines through strong coordination.',
              },
            ]}
          />

          <FinalAssessment assessment="A reliable team member with strong communication, teamwork, and problem-solving skiss. Consistently contributes to positive outcomes." />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
