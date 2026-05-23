'use client';

import { Box, Skeleton, Stack } from '@mui/material';

const CHART_HEIGHT = 420;
const ROW_HEIGHT = 56;
const LEFT_PANEL_WIDTH = 236;
const PROJECT_ROWS = 6;

const timelineBars = [
  [
    { left: '1%', width: '28%' },
    { left: '32%', width: '35%' },
    { left: '72%', width: '22%' },
  ],
  [
    { left: '5%', width: '40%' },
    { left: '50%', width: '42%' },
  ],
  [
    { left: '1%', width: '25%' },
    { left: '30%', width: '38%' },
    { left: '73%', width: '20%' },
  ],
  [
    { left: '2%', width: '45%' },
    { left: '52%', width: '40%' },
  ],
  [
    { left: '1%', width: '30%' },
    { left: '35%', width: '32%' },
    { left: '72%', width: '22%' },
  ],
  [
    { left: '8%', width: '50%' },
    { left: '63%', width: '28%' },
  ],
];

const ProjectTimelineChartSkeleton = () => {
  return (
    <Box
      sx={{
        width: 1,
        height: CHART_HEIGHT,
        display: 'flex',
      }}
    >
      <Stack
        direction="column"
        sx={{
          width: LEFT_PANEL_WIDTH,
          flexShrink: 0,
          height: 1,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Skeleton variant="text" width={100} height={24} sx={{ borderRadius: 1 }} />
        </Box>

        {Array.from({ length: PROJECT_ROWS }).map((_, index) => (
          <Stack
            key={index}
            alignItems="center"
            spacing={1.5}
            sx={{
              px: 2,
              py: 1.5,
              minHeight: ROW_HEIGHT,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Skeleton
              variant="rounded"
              width={4}
              height={20}
              sx={{ borderRadius: 0.5, flexShrink: 0 }}
            />
            <Skeleton
              variant="text"
              width={`${60 + (index % 3) * 20}%`}
              height={20}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        ))}
      </Stack>

      <Stack
        direction="column"
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" width={80} height={24} sx={{ borderRadius: 1 }} />

          <Stack spacing={0.5} sx={{ flex: 1, overflow: 'hidden' }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="text"
                width={24}
                height={20}
                sx={{ borderRadius: 1, flex: 1 }}
              />
            ))}
          </Stack>
        </Stack>

        <Stack direction="column" sx={{ flex: 1 }}>
          {timelineBars.map((bars, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                minHeight: ROW_HEIGHT,
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {bars.map((bar, barIndex) => (
                <Skeleton
                  key={barIndex}
                  variant="rounded"
                  sx={{
                    width: bar.width,
                    position: 'absolute',
                    left: bar.left,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProjectTimelineChartSkeleton;
