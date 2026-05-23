'use client';

import { useMemo } from 'react';
import { Avatar, Box, Chip, Link, Stack, Typography } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import { getStatusChipColor } from '..';

export const columnDefs = [
  {
    ...GRID_CHECKBOX_SELECTION_COL_DEF,
    width: 64,
  },
  {
    field: 'member',
    headerName: 'Member',
    headerClassName: 'member-header',
    cellClassName: 'member-cell',
    flex: 2.1,
    minWidth: 210,
    renderCell: (params) => (
      <Stack gap={1.5} sx={{ alignItems: 'center' }}>
        <Avatar src={params.row.avatar} sx={{ width: 24, height: 24 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
          {params.row.name}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'idNo',
    headerName: 'ID No',
    headerClassName: 'id-no-header',
    cellClassName: 'id-no-cell',
    flex: 1,
    minWidth: 105,
  },
  {
    field: 'jobTitle',
    headerName: 'Job title',
    headerClassName: 'job-title-header',
    cellClassName: 'job-title-cell',
    flex: 1.9,
    minWidth: 180,
    renderCell: (params) => (
      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
        {params.row.jobTitle}
      </Typography>
    ),
  },
  {
    field: 'team',
    headerName: 'Team',
    headerClassName: 'team-header',
    cellClassName: 'team-cell',
    flex: 1.8,
    minWidth: 140,
  },
  {
    field: 'email',
    headerName: 'Email',
    headerClassName: 'email-header',
    cellClassName: 'email-cell',
    flex: 2,
    minWidth: 230,
    renderCell: (params) => (
      <Link href="#!" variant="body2">
        {params.row.email}
      </Link>
    ),
  },
  {
    field: 'phoneNo',
    headerName: 'Phone No',
    headerClassName: 'phone-no-header',
    cellClassName: 'phone-no-cell',
    flex: 1.8,
    minWidth: 160,
  },
  {
    field: 'city',
    headerName: 'City',
    headerClassName: 'city-header',
    cellClassName: 'city-cell',
    flex: 1.4,
    minWidth: 110,
  },
  {
    field: 'status',
    headerName: 'Status',
    headerClassName: 'status-header',
    cellClassName: 'status-cell',
    flex: 1.2,
    minWidth: 115,
    renderCell: (params) => (
      <Chip
        label={params.row.status}
        color={getStatusChipColor(params.row.status)}
        sx={{ flexShrink: 0 }}
      />
    ),
  },
  {
    field: 'hiredDate',
    headerName: 'City',
    headerClassName: 'hired-date-header',
    cellClassName: 'hired-Date-cell',
    flex: 1,
    minWidth: 110,
    renderCell: (params) => (
      <Typography variant="body2">{dayjs(params.row.hiredDate).format('DD MMM, YY')}</Typography>
    ),
  },
  {
    field: 'action',
    headerName: '',
    sortable: false,
    headerClassName: 'action-header',
    cellClassName: 'action-cell',
    width: 64,
    align: 'right',
    headerAlign: 'right',
    renderHeader: () => <DashboardMenu />,
    renderCell: () => <DashboardMenu />,
  },
];

const MembersListView = ({ data }) => {
  const columns = useMemo(() => columnDefs, [dayjs, getStatusChipColor]);
  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 1, pb: 5 }}>
        <DataGrid
          rowHeight={64}
          columns={columns}
          rows={data}
          checkboxSelection
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 7,
              },
            },
          }}
          pageSizeOptions={[7]}
          slots={{
            basePagination: (props) => (
              <DataGridPagination showAllHref="#!" showFullPagination {...props} />
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default MembersListView;
