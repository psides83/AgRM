import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const DetailsTabs = ({ value, onChange, sx }) => {
  return (
    <Box sx={{ ...sx }}>
      <Tabs value={value} onChange={onChange} aria-label="payroll details tabs">
        <Tab label="Employee Summary" value="employee" />
        <Tab label="Tax Summary" value="tax" />
      </Tabs>
    </Box>
  );
};

export default DetailsTabs;
