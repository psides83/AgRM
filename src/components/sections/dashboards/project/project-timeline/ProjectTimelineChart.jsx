'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import dayjs from 'dayjs';
import {
  generateTimeRanges,
  getFromToDates,
  transformProjectTimelineData,
} from 'helpers/gantt-utils';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SvelteGanttChart from 'components/base/SvelteGanttChart';
import ProjectTimelineChartSkeleton from './ProjectTimelineChartSkeleton';

const ProjectTimelineChart = ({ projectTimelineData }) => {
  const { down } = useBreakpoints();
  const [chartReady, setChartReady] = useState(false);
  const [chartMountDeferred, setChartMountDeferred] = useState(true);

  useEffect(() => {
    let id2;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setChartMountDeferred(false));
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2 != null) cancelAnimationFrame(id2);
    };
  }, []);

  const isSmallScreen = down('sm');
  const collapsedWidth = isSmallScreen ? 60 : 180;
  const expandedWidth = isSmallScreen ? 270 : 236;

  const [tableWidth, setTableWidth] = useState(expandedWidth);

  const ganttData = useMemo(
    () => transformProjectTimelineData(projectTimelineData),
    [projectTimelineData],
  );

  const { from, to } = useMemo(() => {
    if (ganttData.tasks.length === 0) {
      const now = dayjs();
      return {
        from: now.startOf('month').valueOf(),
        to: now.endOf('month').valueOf(),
      };
    }
    return getFromToDates(ganttData.tasks);
  }, [ganttData.tasks]);
  const timeRanges = useMemo(() => generateTimeRanges(from, to), [from, to]);

  const toggleTableWidth = () => {
    setTableWidth((prevWidth) => (prevWidth === collapsedWidth ? expandedWidth : collapsedWidth));
  };

  useEffect(() => {
    setTableWidth(expandedWidth);
  }, [isSmallScreen, expandedWidth]);

  const options = useMemo(() => {
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    const numMonths = toDate.diff(fromDate, 'month') + 1;
    const MIN_WIDTH_PER_MONTH = 1700;
    const MAX_MIN_WIDTH = 6800;

    return {
      rows: ganttData.rows.map((row) => ({
        ...row,
        height: 56,
      })),
      tableWidth,
      tasks: ganttData.tasks,
      timeRanges,
      from,
      to,
      minWidth: Math.min(MIN_WIDTH_PER_MONTH * numMonths, MAX_MIN_WIDTH),
      tableHeaders: [{ title: 'All Projects', property: 'label', width: 140, type: 'tree' }],
    };
  }, [ganttData, tableWidth, from, to]);

  return (
    <Box sx={{ width: 1, height: 420, position: 'relative' }}>
      {chartReady && (
        <Button
          color="neutral"
          shape="circle"
          variant="soft"
          sx={({ transitions }) => ({
            position: 'absolute',
            left: `${tableWidth - 14}px`,
            top: 16,
            zIndex: 2,
            transition: transitions.create('left', {
              duration: 300,
              easing: 'ease-in-out',
            }),
            minWidth: 24,
            height: 24,
          })}
          onClick={toggleTableWidth}
        >
          {tableWidth === collapsedWidth ? (
            <IconifyIcon flipOnRTL icon="material-symbols:chevron-right-rounded" />
          ) : (
            <IconifyIcon flipOnRTL icon="material-symbols:chevron-left-rounded" />
          )}
        </Button>
      )}
      <Box sx={{ position: 'relative', width: 1, height: 1 }}>
        {chartMountDeferred ? (
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <ProjectTimelineChartSkeleton />
          </Box>
        ) : (
          <>
            <SvelteGanttChart chartOptions={options} onReady={() => setChartReady(true)} />
            {!chartReady && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                }}
              >
                <ProjectTimelineChartSkeleton />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProjectTimelineChart;
