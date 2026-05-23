import { Grid, Stack } from '@mui/material';
import PanelWrapper from '../PanelWrapper';
import EducationInfo from './EducationInfo';
import ExperienceInfo from './ExperienceInfo';
import PersonalInfoAside from './PersonalInfoAside';

export const PersonalTabPanel = ({ data }) => {
  return (
    <PanelWrapper title="Personal">
      <Grid container columns={24} spacing={{ xs: 1, md: 5 }}>
        <Grid size={{ xs: 24, md: 15 }}>
          <Stack direction="column" gap={3} sx={{ py: 3 }}>
            <ExperienceInfo data={data.experiences} />
            <EducationInfo data={data.education} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 24, md: 9 }}>
          <PersonalInfoAside data={data.overview} />
        </Grid>
      </Grid>
    </PanelWrapper>
  );
};
