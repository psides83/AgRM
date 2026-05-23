import { useState } from 'react';
import { TabContext, TabPanel } from '@mui/lab';
import { Box, Button, Stack, Tab, Tabs } from '@mui/material';
import { videos } from 'data/content/video';
import IconifyIcon from 'components/base/IconifyIcon';
import RelatedVideo from './RelatedVideo';

const fromCreator = videos.filter((item) => item.type === 'related').slice(0, 18);

const recommendations = videos.filter((item) => item.type === 'related').slice(18);

const RelatedVideos = () => {
  const [value, setValue] = useState(1);

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };
  return (
    <Box sx={{ width: { xs: 1, md: 280, lg: 328 } }}>
      <TabContext value={value}>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value={1} label="From Creator" />
          <Tab value={2} label="Recommendations" />
        </Tabs>

        <TabPanel value={1} sx={{ px: 0, pb: 0 }}>
          <Stack direction="column" sx={{ gap: { xs: 1, md: 2 } }}>
            {fromCreator.map((item) => (
              <RelatedVideo item={item} key={item.id} />
            ))}
          </Stack>
        </TabPanel>

        <TabPanel value={2} sx={{ px: 0, pb: 0 }}>
          <Stack direction="column" sx={{ gap: { xs: 1, md: 2 } }}>
            {recommendations.map((item) => (
              <RelatedVideo item={item} key={item.id} />
            ))}
          </Stack>
        </TabPanel>
      </TabContext>

      <Stack
        sx={{
          justifyContent: 'flex-end',
          mt: 3,
        }}
      >
        <Button
          size="small"
          endIcon={<IconifyIcon icon="material-symbols:chevron-right-rounded" />}
          sx={{
            alignItems: 'center',
          }}
        >
          View All
        </Button>
      </Stack>
    </Box>
  );
};

export default RelatedVideos;
