import { Divider, Stack } from '@mui/material';
import PanelWrapper from '../PanelWrapper';
import ProjectList from './ProjectList';
import TeamsStats from './TeamsStats';

export const TeamOverviewTabPanel = ({ data }) => {
  return (
    <PanelWrapper title="Team Overview">
      <Stack direction="column" divider={<Divider flexItem />}>
        <TeamsStats data={data.assignedTeams} />
        <ProjectList data={data.projectList} />
      </Stack>
    </PanelWrapper>
  );
};
