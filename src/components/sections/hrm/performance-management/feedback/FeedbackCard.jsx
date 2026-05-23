import { Fragment, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';
import ReportDialog from './feedback-dialog/ReportDialog';
import ReportFormDialog from './feedback-dialog/ReportFormDialog';

const formatAppraisalType = (value) =>
  value.replace(/\s+for\s+\d{4}$/i, '').replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());

const FeedbackCard = ({ feedback, sx, ...rest }) => {
  const { user, date, message, rating, assessment } = feedback;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  return (
    <Fragment>
      <Card
        role="button"
        background={1}
        onClick={() => {
          if (assessment === 'Received' || assessment === 'Given') setDialogOpen(true);
          if (assessment === 'Self Assessment') setFormDialogOpen(true);
        }}
        sx={{
          borderRadius: 6,
          outline: 0,
          overflow: 'hidden',
          height: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'background.elevation2' },
          ...sx,
        }}
        {...rest}
      >
        <CardContent
          sx={({ spacing }) => ({
            py: { xs: `${spacing(1.5)} !important`, md: `${spacing(3)} !important` },
            px: { xs: `${spacing(2)} !important`, md: `${spacing(4)} !important` },
          })}
        >
          <Stack gap={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 1.5, md: 3 } }}>
            <Stack gap={{ xs: 1, sm: 2 }} sx={{ flexGrow: 1 }}>
              {assessment !== 'Self Assessment' && (
                <Tooltip title={user.name}>
                  <Avatar src={user.avatar} sx={{ width: 48, height: 48 }} />
                </Tooltip>
              )}
              <div>
                {assessment === 'Received' && (
                  <Typography variant="subtitle1" sx={{ mb: 0.25 }}>
                    <Box component="strong">{user.name}</Box>
                    {` `}gave feedback
                  </Typography>
                )}
                {assessment === 'Given' && (
                  <Typography variant="subtitle1" sx={{ mb: 0.25 }}>
                    You gave feedback to{` `}
                    <Box component="strong">{user.name}</Box>
                  </Typography>
                )}
                {assessment === 'Self Assessment' && (
                  <Typography fontWeight={600} variant="subtitle1" sx={{ mb: 0.25 }}>
                    Self Assessment
                  </Typography>
                )}
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                  <Box component="span" sx={{ fontWeight: 500, mr: 1 }}>
                    {formatAppraisalType(feedback.appraisalType)}
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {dayjs(date).format('MMM D, YYYY')}
                  </Box>
                </Typography>
              </div>
            </Stack>
            <DashboardMenu />
          </Stack>
          <Stack
            direction={{ xs: 'column', xl: 'row' }}
            gap={1}
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={({ breakpoints }) => ({
                lineClamp: 2,
                [breakpoints.up('lg')]: { lineClamp: 1 },
              })}
            >
              {message}
            </Typography>
            <Rating value={rating} size="small" readOnly />
          </Stack>
        </CardContent>
      </Card>
      <ReportDialog open={dialogOpen} feedback={feedback} onClose={() => setDialogOpen(false)} />
      <ReportFormDialog
        open={formDialogOpen}
        feedback={feedback}
        onClose={() => setFormDialogOpen(false)}
      />
    </Fragment>
  );
};

export default FeedbackCard;
