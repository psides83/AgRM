import { useMemo } from 'react';
import Avatar, { avatarClasses } from '@mui/material/Avatar';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid/colDef';
import { gridClasses } from '@mui/x-data-grid/constants';
import { appraisalList } from 'data/hrm/performance-management';
import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

const ListTable = ({ apiRef, filterButtonEl }) => {
  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'member',
        headerName: 'Member',
        headerClassName: 'member-header',
        cellClassName: 'member-cell',
        valueGetter: ({ name }) => name,
        renderCell: (params) => {
          return (
            <Stack gap={1.5} alignItems="center">
              <Avatar src={params.row.member.avatar} sx={{ width: 24, height: 24 }} />
              <Stack direction="column" gap={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  {params.row.member.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {`ID: ${params.row.member.empId}`}
                </Typography>
              </Stack>
            </Stack>
          );
        },
        minWidth: 200,
        flex: 20,
      },
      {
        field: 'appraisalCycle',
        headerName: 'Appraisal Cycle',
        headerClassName: 'appraisal-cycle-header',
        cellClassName: 'appraisal-cycle-cell',
        valueGetter: ({ appraisalDate }) => appraisalDate,
        renderCell: (params) => {
          return (
            <Typography variant="body2" color="text.secondary">
              {`Annual review for ${params.row.appraisalCycle}`}
            </Typography>
          );
        },
        minWidth: 210,
        flex: 23,
      },
      {
        field: 'fromDate',
        headerName: 'From',
        headerClassName: 'from-header',
        cellClassName: 'from-cell',
        valueGetter: ({ fromDate }) => fromDate,
        renderCell: (params) => {
          return (
            <Typography variant="body2" color="text.secondary">
              {dayjs(params.row.fromDate).format('DD MMM, YYYY')}
            </Typography>
          );
        },
        minWidth: 120,
        flex: 10,
      },
      {
        field: 'toDate',
        headerName: 'To',
        headerClassName: 'to-header',
        cellClassName: 'to-cell',
        valueGetter: ({ toDate }) => toDate,
        renderCell: (params) => {
          return (
            <Typography variant="body2" color="text.secondary">
              {dayjs(params.row.toDate).format('DD MMM, YYYY')}
            </Typography>
          );
        },
        minWidth: 120,
        flex: 10,
      },
      {
        field: 'mainEvaluator',
        headerName: 'Main Evaluator',
        headerClassName: 'main-evaluator-header',
        cellClassName: 'main-evaluator-cell',
        renderCell: (params) => {
          return (
            <Stack gap={1.5} alignItems="center">
              <Avatar src={params.row.member.avatar} sx={{ width: 24, height: 24 }} />
              <Typography variant="subtitle2" color="text.secondary">
                {params.row.mainEvaluator.name}
              </Typography>
            </Stack>
          );
        },
        minWidth: 180,
        flex: 14,
      },
      {
        field: 'otherEvaluators',
        headerName: 'Other Evaluators',
        align: 'right',
        headerAlign: 'right',
        headerClassName: 'other-evaluators-header',
        cellClassName: 'other-evaluators-cell',
        renderCell: (params) => {
          return (
            <AvatarGroup
              max={5}
              color="primary"
              sx={{
                display: 'inline-flex',
                [`& .${avatarClasses.root}`]: {
                  width: 24,
                  height: 24,
                  fontSize: 12.8,
                  fontWeight: 'medium',
                  backgroundColor: 'primary.main',
                },
                [`& .${avatarGroupClasses.avatar}`]: {
                  '&:nth-of-type(1)': {
                    mr: 0,
                  },
                },
              }}
            >
              {params.row.otherEvaluators.map((evaluator) => (
                <Tooltip title={evaluator.name} key={evaluator.id}>
                  <Avatar alt={evaluator.name} src={evaluator.avatar} />
                </Tooltip>
              ))}
            </AvatarGroup>
          );
        },
        minWidth: 150,
        flex: 13,
      },
      {
        field: 'reviewProgress',
        headerName: 'Review Progress',
        align: 'right',
        headerAlign: 'right',
        headerClassName: 'review-progress-header',
        cellClassName: 'review-progress-cell',
        renderCell: (params) => {
          return (
            <Box
              sx={{
                width: 109,
                height: 8,
                borderRadius: 0.5,
                overflow: 'hidden',
              }}
            >
              <LinearProgress
                value={params.row.reviewProgress}
                variant="determinate"
                sx={{
                  height: 1,
                  borderRadius: 0.5,
                }}
              />
            </Box>
          );
        },
        minWidth: 160,
        flex: 13,
      },
      {
        field: 'ratings',
        headerName: 'Ratings',
        align: 'right',
        headerAlign: 'right',
        headerClassName: 'ratings-header',
        cellClassName: 'ratings-cell',
        renderCell: (params) => {
          const rating = params.row.ratings;
          return <Rating size="small" value={rating} readOnly />;
        },
        minWidth: 155,
        flex: 13,
      },
      {
        field: 'action',
        headerName: '',
        headerClassName: 'action-header',
        cellClassName: 'action-cell',
        sortable: false,
        filterable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [],
  );

  return (
    <Stack direction="column" sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={appraisalList}
        apiRef={apiRef}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 8,
            },
          },
        }}
        pageSizeOptions={[8, appraisalList.length]}
        checkboxSelection
        slotProps={{
          panel: {
            target: filterButtonEl,
          },
        }}
        slots={{
          basePagination: (props) => (
            <DataGridPagination showFullPagination showAllHref="#!" {...props} />
          ),
        }}
        sx={({ spacing }) => ({
          [`& .${gridClasses.columnHeaders}`]: {
            minWidth: 1,
            [`& .${gridClasses.columnHeader}`]: {
              '&:not(.MuiDataGrid-columnHeaderCheckbox, .action-header)': {
                p: `0 ${spacing(1.25)}`,
              },
              '&.action-header': {
                pl: spacing(1.25),
              },
            },
          },
          [`& .${gridClasses.row}`]: {
            [`& .${gridClasses.cell}`]: {
              '&.agrm-data-grid-cell': {
                '&:not(.MuiDataGrid-cellCheckbox, .action-cell)': {
                  p: `0 ${spacing(1.25)}`,
                },
                '&.action-cell': {
                  pl: spacing(1.25),
                },
              },
            },
          },
        })}
      />
    </Stack>
  );
};

export default ListTable;
