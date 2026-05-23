'use client';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import NewMemberStepper from 'components/sections/member/new-member/NewMemberStepper';

const NewMember = () => {
  return (
    <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h4" mb={3}>
          Add new Member
        </Typography>

        <NewMemberStepper />
      </Container>
    </Paper>
  );
};
export default NewMember;
