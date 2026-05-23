import { Avatar, ButtonBase, Stack, Typography, styled } from '@mui/material';

const OrgCard = ({ data }) => {
  return (
    <OrgCardWrapper>
      <Stack gap={2} sx={{ alignItems: 'center' }}>
        <Avatar src={data.avatar} sx={{ width: 56, height: 56 }} />
        <Stack direction="column" sx={{ alignItems: 'flex-start' }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, color: 'text.disabled', textWrap: 'nowrap' }}
          >
            {data.idNo}
          </Typography>
          <Stack direction="column" sx={{ alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textWrap: 'nowrap' }}>
              {data.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 300, textWrap: 'nowrap' }}>
              {data.jobTitle}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </OrgCardWrapper>
  );
};
const OrgCardWrapper = styled((props) => <ButtonBase component="div" {...props} />)(
  ({ theme }) => ({
    outline: 0,
    position: 'relative',
    borderRadius: Number(theme.shape.borderRadius) * 6,
    padding: theme.spacing(2),
    display: 'inline-flex',
    backgroundColor: theme.vars.palette.background.elevation2,
    cursor: 'pointer',
    transition: theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.easeInOut,
    }),
    '&:hover': {
      backgroundColor: theme.vars.palette.background.elevation3,
    },
    ...(theme.direction === 'rtl' && { direction: 'ltr' }),
  }),
);
export default OrgCard;
