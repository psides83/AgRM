import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import useNumberFormat from 'hooks/useNumberFormat';
import { getPastDates } from 'lib/utils';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import TableLabelDisplayedRows from 'components/pagination/TableLabelDisplayedRows';

dayjs.extend(duration);

const defaultPageSize = 6;

const getTimeRange = (type) => {
  if (type === 'last 2 weeks') {
    return getPastDates(14).map((day) => dayjs(day).format('ddd, D MMM'));
  } else if (type === 'last 30 days') {
    return getPastDates(30).map((day) => dayjs(day).format('ddd, D MMM'));
  } else {
    return getPastDates('week').map((day) => dayjs(day).format('ddd, D MMM'));
  }
};

const formatTime = (totalSeconds) => {
  const timeDuration = dayjs.duration(totalSeconds, 'seconds');
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = timeDuration.minutes().toString().padStart(2, '0');
  const seconds = timeDuration.seconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

const addTimes = (times) => {
  return times.reduce((acc, curr) => curr.map((item, index) => (acc[index] || 0) + item), []);
};

const filterData = (project, filterBy) => {
  if (filterBy.member) {
    return project.workLogs.find((item) => item.user.name === filterBy.member)?.durations ?? [];
  }

  if (filterBy.team) {
    const durations = project.workLogs
      .filter((item) => {
        if (item.team === filterBy.team) {
          return item;
        }
      })
      .map((item) => item.durations);

    return addTimes(durations);
  }

  const durations = project.workLogs.map((item) => item.durations);
  return addTimes(durations);
};

const TimesheetTable = ({ apiRef, filterBy, timesheet, filterButtonEl }) => {
  const { currencyFormat } = useNumberFormat();
  const timerange = getTimeRange(filterBy.timeframe);
  const { up } = useBreakpoints();
  const upLg = up('lg');

  const rows = timesheet.map((project) => {
    const times = filterData(project, filterBy).slice(-timerange.length);
    const totalTimes = times.reduce((sum, seconds) => sum + seconds, 0);

    return {
      ...project,
      totalTimes: formatTime(totalTimes),
      ...Object.fromEntries(
        timerange.map((day, index) => [day.replace(/[^a-zA-Z0-9]/g, ''), formatTime(times[index])]),
      ),
    };
  });

  const columns = useMemo(
    () => [
      {
        field: 'project',
        headerName: 'Project',
        headerClassName: 'project-header',
        cellClassName: 'project-cell',
        minWidth: 260,
        flex: 1,
      },
      ...timerange.map((day) => ({
        field: day.replace(/[^a-zA-Z0-9]/g, ''),
        headerName: day,
        headerClassName: 'day-header',
        cellClassName: 'day-cell',
        minWidth: 130,
        align: 'right',
        headerAlign: 'right',
        flex: 1,
      })),
      {
        field: 'totalTimes',
        headerName: 'Total',
        headerClassName: 'total-times-header',
        cellClassName: 'total-times-cell',
        flex: 1,
        fontWeight: 'bold',
        align: 'right',
        headerAlign: 'right',
        minWidth: 140,
        renderCell: (params) => (
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            {params.row.totalTimes}
          </Typography>
        ),
      },
      {
        field: 'action',
        headerAlign: 'right',
        headerClassName: 'action-header',
        cellClassName: 'action-cell',
        align: 'right',
        editable: false,
        sortable: false,
        flex: 1,
        minWidth: 80,
        renderHeader: () => <DashboardMenu />,
        renderCell: () => <DashboardMenu />,
      },
    ],
    [currencyFormat],
  );

  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={rows}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize, rows.length]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: defaultPageSize,
            },
          },
        }}
        slots={{
          basePagination: (props) => (
            <DataGridPagination
              showAllHref="#!"
              labelDisplayedRows={upLg ? TableLabelDisplayedRows : () => null}
              {...props}
            />
          ),
        }}
        slotProps={{
          panel: {
            target: filterButtonEl,
          },
        }}
        sx={({ spacing }) => ({
          [`& .${gridClasses.columnHeaders}`]: {
            [`& .${gridClasses.columnHeader}`]: {
              '&:not(.project-header, .action-header)': {
                p: `0 ${spacing(1.25)}`,
              },
              '&.project-header': {
                pr: spacing(1.25),
              },
              '&.action-header': {
                pl: spacing(1.25),
              },
            },
          },
          [`& .${gridClasses.row}`]: {
            [`& .${gridClasses.cell}`]: {
              '&.agrm-data-grid-cell': {
                '&:not(.project-cell, .action-cell)': {
                  p: `0 ${spacing(1.25)}`,
                },
                '&.project-cell': {
                  pr: spacing(1.25),
                },
                '&.action-cell': {
                  pl: spacing(1.25),
                },
              },
            },
          },
        })}
      />
    </Box>
  );
};

export default TimesheetTable;
