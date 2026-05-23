import { useState } from 'react';
import { TabContext, TabPanel } from '@mui/lab';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import PodcastDetails from './PodcastDetails';
import PodcastInfo from './PodcastInfo';
import PodcastTranscript from './PodcastTranscript';

const ExpandedPlayer = () => {
  const [value, setValue] = useState(1);

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={{ xs: 3, md: 5 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <PodcastInfo />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="podcast details tab">
              <Tab value={1} label="Details" />
              <Tab value={2} label="Transcript" />
            </Tabs>
          </Box>

          <TabPanel value={1} sx={{ p: 2 }}>
            <PodcastDetails />
          </TabPanel>

          <TabPanel
            value={2}
            sx={{
              p: 2,
            }}
          >
            <PodcastTranscript />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  );
};

export default ExpandedPlayer;
