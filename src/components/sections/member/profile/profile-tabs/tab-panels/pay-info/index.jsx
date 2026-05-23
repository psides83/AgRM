import { Divider, Stack } from '@mui/material';
import PanelWrapper from '../PanelWrapper';
import MonthlyPayroll from './MonthlyPayroll';
import PayHistory from './PayHistory';

export const PayInfoTabPanel = ({ data }) => {
  return (
    <PanelWrapper title="Pay Info">
      <Stack direction="column" divider={<Divider flexItem />}>
        <MonthlyPayroll data={data.monthlyPayroll} />
        <PayHistory data={data.history} />
      </Stack>
    </PanelWrapper>
  );
};
