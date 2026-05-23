import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Avatar, Badge, Box, Button, Grid, Stack } from '@mui/material';
import { users } from 'data/users';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';

const CommentFormSchema = yup.object({
  comment: yup.string().required('Comment is required.'),
});

const CommentForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CommentFormSchema),
    defaultValues: {
      comment: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3 }}>
      <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color="success"
        >
          <Avatar src={users[3].avatar} alt="avatar" sx={{ width: 32, height: 32 }} />
        </Badge>

        <Box sx={{ flexGrow: 1 }}>
          <StyledTextField
            id="comment"
            type="text"
            multiline
            minRows={2}
            error={!!errors.comment}
            helperText={errors.comment?.message}
            size="small"
            placeholder="Add your comment"
            {...register('comment')}
            sx={{
              width: 1,
              mb: 2,
              ['& .MuiFilledInput-root']: {
                paddingTop: '4px',
              },
            }}
          />

          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size="auto">
              <Stack sx={{ alignItems: 'center' }}>
                <Button type="button" color="neutral" shape="square">
                  <IconifyIcon
                    icon="material-symbols:image-outline-rounded"
                    sx={{ fontSize: 20 }}
                  />
                </Button>
                <Button type="button" color="neutral" shape="square">
                  <IconifyIcon
                    icon="material-symbols:format-italic-rounded"
                    sx={{ fontSize: 20 }}
                  />
                </Button>
                <Button type="button" color="neutral" shape="square">
                  <IconifyIcon icon="material-symbols:format-bold-rounded" sx={{ fontSize: 20 }} />
                </Button>
              </Stack>
            </Grid>
            <Grid size="auto" sx={{ ml: 'auto' }}>
              <Button variant="contained" color="primary" type="submit">
                Comment
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default CommentForm;
