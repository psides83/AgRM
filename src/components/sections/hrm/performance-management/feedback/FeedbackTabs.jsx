import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const FeedbackTabs = ({ value, onChange, sx }) => {
  return (
    <Box sx={{ px: { xs: 3, md: 5 }, ...sx }}>
      <Tabs value={value} onChange={onChange} aria-label="feedbacks tabs">
        <Tab label="Received" value="Received" />
        <Tab label="Given" value="Given" />
        <Tab label="Self Assessment" value="Self Assessment" />
      </Tabs>
    </Box>
  );
};

export default FeedbackTabs;
