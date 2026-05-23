import { Divider, Grid, Stack } from '@mui/material';
import PanelWrapper from '../PanelWrapper';
import AppliedLeave from './AppliedLeave';
import BasicInfo from './BasicInfo';
import History from './History';

export const TimeOffTabPanel = ({ data }) => {
  return (
    <PanelWrapper title="Time Off">
      <Stack direction="column" divider={<Divider flexItem />}>
        <Grid container columns={20} spacing={5} sx={{ pb: 3 }}>
          <Grid size={{ xs: 20, sm: 8 }}>
            <BasicInfo data={data.basicInfo.chart} />
          </Grid>
          <Grid size={{ xs: 20, sm: 12 }}>
            <AppliedLeave data={data.basicInfo.appliedLeave} />
          </Grid>
        </Grid>

        <History data={data.history} />
      </Stack>
    </PanelWrapper>
  );
};
