import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { filledInputClasses } from '@mui/material/FilledInput';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import FinalAssessment from './FinalAssessment';
import Questions from './Questions';
import RatingCard from './RatingCard';
import ReportInfo from './ReportInfo';

const reportFormValuesSchema = yup.object({
  communication: yup.object({
    rating: yup.array().of(yup.number().required()).required(),
    comment: yup.string().required().nullable(),
  }),
  teamwork: yup.object({
    rating: yup.array().of(yup.number().required()).required(),
    comment: yup.string().required().nullable(),
  }),
  problemSolving: yup.object({
    rating: yup.array().of(yup.number().required()).required(),
    comment: yup.string().required().nullable(),
  }),
  questions: yup.array().of(yup.string().required()).required().nullable(),
  finalAssessment: yup.string().required().nullable(),
});

const ReportFormDialog = ({ feedback, onClose, sx, ...rest }) => {
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({
    resolver: yupResolver(reportFormValuesSchema),
    defaultValues: {
      communication: { rating: [5, 5, 5], comment: '' },
      teamwork: { rating: [5, 5, 5, 5], comment: '' },
      problemSolving: { rating: [5, 5, 5], comment: '' },
      questions: [],
      finalAssessment: '',
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = (data) => {
    console.log({ data });
    enqueueSnackbar('Assessment submitted successfully', { variant: 'success' });
    onClose();
  };
  return (
    <FormProvider {...methods}>
      <Dialog
        scroll="body"
        maxWidth={false}
        onClose={onClose}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit(onSubmit),
          },
        }}
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
              fieldPrefix="communication"
              ratingList={[
                { label: 'Clarity', rating: 5 },
                { label: 'Listening', rating: 5 },
                { label: 'Speaking', rating: 5 },
              ]}
              formField={
                <TextField
                  multiline
                  fullWidth
                  rows={2}
                  placeholder="Add Comment"
                  error={!!errors.communication?.comment}
                  helperText={
                    <>
                      <IconifyIcon
                        icon="material-symbols:info-outline-rounded"
                        sx={{ fontSize: 16 }}
                      />
                      <Typography variant="caption">
                        Type your comment and press Enter to add it.
                      </Typography>
                    </>
                  }
                  sx={{
                    [`& .${filledInputClasses.root}`]: { py: 1 },
                    [`& .${formHelperTextClasses.root}`]: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.secondary',
                    },
                  }}
                  {...register('communication.comment')}
                />
              }
            />

            <ReportInfo
              title="Teamwork"
              fieldPrefix="teamwork"
              ratingList={[
                { label: 'Cooperation', rating: 5 },
                { label: 'Supportiveness', rating: 5 },
                { label: 'Conflict Resolution', rating: 5 },
                { label: 'Respect for Others', rating: 5 },
              ]}
              formField={
                <TextField
                  multiline
                  fullWidth
                  rows={2}
                  placeholder="Add Comment"
                  error={!!errors.teamwork?.comment}
                  helperText={
                    <>
                      <IconifyIcon
                        icon="material-symbols:info-outline-rounded"
                        sx={{ fontSize: 16 }}
                      />
                      <Typography variant="caption">
                        Type your comment and press Enter to add it.
                      </Typography>
                    </>
                  }
                  sx={{
                    [`& .${filledInputClasses.root}`]: { py: 1 },
                    [`& .${formHelperTextClasses.root}`]: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.secondary',
                    },
                  }}
                  {...register('teamwork.comment')}
                />
              }
            />

            <ReportInfo
              title="Problem Solving"
              fieldPrefix="problemSolving"
              ratingList={[
                { label: 'Analytical Thinking', rating: 5 },
                { label: 'Decision Making', rating: 5 },
                { label: 'Creativity', rating: 5 },
              ]}
              formField={
                <TextField
                  multiline
                  fullWidth
                  rows={2}
                  placeholder="Add Comment"
                  error={!!errors.problemSolving?.comment}
                  helperText={
                    <>
                      <IconifyIcon
                        icon="material-symbols:info-outline-rounded"
                        sx={{ fontSize: 16 }}
                      />
                      <Typography variant="caption">
                        Type your comment and press Enter to add it.
                      </Typography>
                    </>
                  }
                  sx={{
                    [`& .${filledInputClasses.root}`]: { py: 1 },
                    [`& .${formHelperTextClasses.root}`]: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.secondary',
                    },
                  }}
                  {...register('problemSolving.comment')}
                />
              }
            />

            <Questions
              questions={[
                {
                  question: 'How does the employee handle communication challenges?',
                },
                {
                  question: 'How does the employee demonstrated teamwork?',
                },
              ]}
            />

            <FinalAssessment />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            pt: 0,
            pb: { xs: 3, md: 5 },
            px: { xs: 3, md: 5 },
          }}
        >
          <Button color="neutral" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button type="reset" variant="soft" color="neutral" onClick={() => onClose()}>
            Save
          </Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
};

export default ReportFormDialog;
