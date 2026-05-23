'use client';
import React, { useMemo, useState } from 'react';
import { Link, MenuItem, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { currencyFormat } from 'lib/utils';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import StyledTextField from 'components/styled/StyledTextField';

const columnDefs = [
  {
    field: 'payDate',
    headerName: 'Pay Date',
    headerClassName: 'pay-date-header',
    cellClassName: 'pay-date-cell',
    flex: 1.33,
    minWidth: 120,
    renderCell: (params) => (
      <Link href="#!" variant="body2">
        {dayjs(params.row.payDate).format('DD MMM, YYYY')}
      </Link>
    ),
  },
  {
    field: 'hours',
    headerName: 'Hours',
    headerClassName: 'hours-header',
    cellClassName: 'hours-cell',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'grossPay',
    headerName: 'Gross Pay',
    headerClassName: 'gross-pay-header',
    cellClassName: 'gross-pay-cell',
    flex: 1.25,
    minWidth: 100,
    renderCell: (params) =>
      currencyFormat(params.row.grossPay, 'en-US', { maximumFractionDigits: 0 }),
  },
  {
    field: 'totalDeduction',
    headerName: 'Total Deduction',
    headerClassName: 'total-deduction-header',
    cellClassName: 'total-deduction-cell',
    flex: 1.25,
    minWidth: 100,
    renderCell: (params) =>
      currencyFormat(params.row.totalDeduction, 'en-US', { maximumFractionDigits: 0 }),
  },
  {
    field: 'netPay',
    headerName: 'Net Pay',
    headerClassName: 'net-pay-header',
    cellClassName: 'net-pay-cell',
    flex: 1.2,
    minWidth: 120,
    headerAlign: 'right',
    align: 'right',
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {currencyFormat(params.row.grossPay - params.row.totalDeduction, 'en-US', {
          maximumFractionDigits: 0,
        })}
      </Typography>
    ),
  },
  {
    field: 'action',
    headerName: '',
    sortable: false,
    headerClassName: 'action-header',
    cellClassName: 'action-cell',
    filterable: false,
    width: 64,
    align: 'right',
    headerAlign: 'right',
    renderHeader: () => <DashboardMenu />,
    renderCell: () => <DashboardMenu />,
  },
];
const PayHistory = ({ data }) => {
  const columns = useMemo(() => columnDefs, [currencyFormat, dayjs]);
  return (
    <Stack direction="column" gap={2} sx={{ pt: 3 }}>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          History
        </Typography>

        <TopAction />
      </Stack>

      <Stack direction="column" sx={{ width: 1 }}>
        <DataGrid
          rows={data}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 6,
              },
            },
          }}
          pageSizeOptions={[6]}
          slots={{
            basePagination: (props) => (
              <DataGridPagination showAllHref="#!" showFullPagination {...props} />
            ),
          }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              '& .MuiDataGrid-columnHeader': {
                '&.pay-date-header': {
                  paddingLeft: 3,
                },
              },
            },
          }}
        />
      </Stack>
    </Stack>
  );
};
const TopAction = () => {
  const [sortBy, setSortBy] = useState('6-months');
  return (
    <StyledTextField
      select
      value={sortBy}
      fullWidth
      onChange={(event) => setSortBy(event.target.value)}
      sx={{ maxWidth: 234 }}
    >
      <MenuItem value="week">Sort by - Last week</MenuItem>
      <MenuItem value="month">Sort by - Last month</MenuItem>
      <MenuItem value="3-months">Sort by - Last 3 months</MenuItem>
      <MenuItem value="6-months">Sort by - Last 6 months</MenuItem>
    </StyledTextField>
  );
};
export default PayHistory;
