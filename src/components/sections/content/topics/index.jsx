import { Fragment, useMemo } from 'react';
import { Grid, Pagination, Stack, Typography } from '@mui/material';
import { contentTopics } from 'data/content/topics';
import TopicList from './TopicList';

const TopicsContainer = ({ searchQuery }) => {
  const filteredItems = useMemo(() => {
    return contentTopics.map((topic) => ({
      ...topic,
      topics: topic.topics.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }));
  }, [searchQuery, contentTopics]);

  const topics = filteredItems.flatMap((item) => item.topics);

  return (
    <Stack direction="column" sx={{ gap: 4 }}>
      <Grid container spacing={2}>
        {filteredItems.map((item) => (
          <Fragment key={item.id}>
            {item.topics.length > 0 && (
              <Grid size={{ xs: 6, md: 4 }} key={item.id} sx={{ p: { sm: 1 } }}>
                <>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {item.category}
                  </Typography>

                  <TopicList item={item.topics} />
                </>
              </Grid>
            )}
          </Fragment>
        ))}
      </Grid>

      {topics.length > 0 && (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Pagination
            count={15}
            variant="solid"
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </Stack>
  );
};

export default TopicsContainer;
