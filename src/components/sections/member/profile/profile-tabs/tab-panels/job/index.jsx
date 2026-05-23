import { Box, Grid, Typography } from '@mui/material';
import PanelWrapper from '../PanelWrapper';
import JobInfoAside from './JobInfoAside';
import JobInfoTable from './JobInfoTable';
import TeamMembers from './TeamMembers';

export const JobTabPanel = ({ data }) => {
  return (
    <PanelWrapper title="Job">
      <Grid container columns={24} spacing={{ xs: 3, sm: 1, lg: 5 }}>
        <Grid size={{ xs: 24, md: 15 }}>
          <Box sx={{ py: { xs: 0, md: 3 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Team Members ({data.teamMembers.length})
            </Typography>
            <TeamMembers members={data.teamMembers} />
          </Box>
        </Grid>
        <Grid size={{ xs: 24, md: 9 }}>
          <JobInfoAside data={data.overview} />
        </Grid>
        <Grid size={24}>
          <JobInfoTable data={data.jobInformation} />
        </Grid>
      </Grid>
    </PanelWrapper>
  );
};
