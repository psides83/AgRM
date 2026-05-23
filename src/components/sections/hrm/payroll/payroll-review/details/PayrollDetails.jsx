import { useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { gridClasses } from '@mui/x-data-grid/constants';
import { employeeSummaryData, taxSummaryData } from 'data/hrm/payroll/payroll-review';
import { currencyFormat } from 'lib/utils';
import DataGridPagination from 'components/pagination/DataGridPagination';
import DetailsTabs from './DetailsTabs';

const employeeColumns = [
  {
    field: 'employee',
    headerName: 'Employees',
    headerClassName: 'employee-header',
    cellClassName: 'employee-cell',
    flex: 1.85,
    minWidth: 180,
    valueGetter: ({ name }) => name,
    renderCell: (params) => {
      return (
        <Stack gap={1} sx={{ alignItems: 'center' }}>
          <Avatar src={params.row.employee.avatar} sx={{ width: 24, height: 24 }} />
          <Stack direction="column" gap={0.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {params.row.employee.name}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              ID: {params.row.employee.empId}
            </Typography>
          </Stack>
        </Stack>
      );
    },
  },
  {
    field: 'totalHours',
    headerName: 'Total Hours',
    headerClassName: 'total-hours-header',
    cellClassName: 'total-hours-cell',
    flex: 1,
    minWidth: 110,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.row.totalHours}hrs
        </Typography>
      );
    },
  },
  {
    field: 'totalGross',
    headerName: 'Total Gross',
    headerClassName: 'total-gross-header',
    cellClassName: 'total-gross-cell',
    headerAlign: 'right',
    align: 'right',
    flex: 1.23,
    minWidth: 120,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currencyFormat(params.row.totalGross, 'en-US', { maximumFractionDigits: 0 })}
        </Typography>
      );
    },
  },
  {
    field: 'totalDeduction',
    headerName: 'Total Deduction',
    headerClassName: 'total-deduction-header',
    cellClassName: 'total-deduction-cell',
    headerAlign: 'right',
    align: 'right',
    flex: 1.23,
    minWidth: 140,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currencyFormat(params.row.totalDeduction, 'en-US', { maximumFractionDigits: 0 })}
        </Typography>
      );
    },
  },
  {
    field: 'netPay',
    headerName: 'Net Pay',
    headerAlign: 'right',
    headerClassName: 'net-pay-header',
    cellClassName: 'net-pay-cell',
    align: 'right',
    flex: 1.25,
    minWidth: 145,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currencyFormat(params.row.totalGross - params.row.totalDeduction, 'en-US', {
            maximumFractionDigits: 0,
          })}
        </Typography>
      );
    },
  },
];
const taxColumns = [
  {
    field: 'employees',
    headerName: 'Employees',
    headerClassName: 'employees-header',
    cellClassName: 'employees-cell',
    flex: 1.5,
    minWidth: 185,
    renderCell: (params) => {
      return (
        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
          {params.row.employees}
        </Typography>
      );
    },
  },
  {
    field: 'employeeTaxes',
    headerName: 'Employee Taxes',
    headerClassName: 'employee-tax-header',
    cellClassName: 'employee-tax-cell',
    flex: 1,
    minWidth: 145,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currencyFormat(params.row.employeeTaxes, 'en-US', { maximumFractionDigits: 0 })}
        </Typography>
      );
    },
  },
  {
    field: 'companyTaxes',
    headerName: 'Company Taxes',
    headerClassName: 'company-tax-header',
    cellClassName: 'company-tax-cell',
    flex: 1,
    minWidth: 145,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currencyFormat(params.row.companyTaxes, 'en-US', { maximumFractionDigits: 0 })}
        </Typography>
      );
    },
  },
  {
    field: 'total',
    headerName: 'Total',
    headerAlign: 'right',
    headerClassName: 'total-header',
    cellClassName: 'total-cell',
    align: 'right',
    flex: 1.3,
    minWidth: 80,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currencyFormat(params.row.employeeTaxes - params.row.companyTaxes, 'en-US', {
            maximumFractionDigits: 0,
          })}
        </Typography>
      );
    },
  },
];

const PayrollDetails = () => {
  const [tab, setTab] = useState('employee');

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const activeColumns = useMemo(() => (tab === 'employee' ? employeeColumns : taxColumns), [tab]);

  const activeRows = useMemo(
    () => (tab === 'employee' ? employeeSummaryData : taxSummaryData),
    [tab],
  );

  return (
    <div>
      <Stack gap={1} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Payroll Details
        </Typography>
        <Button variant="soft" color="neutral">
          Export
        </Button>
      </Stack>

      <DetailsTabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }} />

      <Stack direction="column" sx={{ width: 1 }}>
        <DataGrid
          rowHeight={64}
          columns={activeColumns}
          rows={activeRows}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 6,
              },
            },
          }}
          pageSizeOptions={[6, activeRows.length]}
          slots={{
            basePagination: (props) => (
              <DataGridPagination showAllHref="#!" showFullPagination {...props} />
            ),
          }}
          sx={({ spacing }) => ({
            '& .MuiDataGrid-columnHeader[aria-colindex="1"]': {
              paddingLeft: 3,
            },
            [`& .${gridClasses.columnHeaders}`]: {
              minWidth: 1,
              [`& .${gridClasses.columnHeader}`]: {
                '&:not(.employee-header, .employees-header, .net-pay-header, .total-header)': {
                  p: `0 ${spacing(1.25)}`,
                },
                '&.employee-header, &.employees-header': {
                  pr: spacing(1.25),
                },
                '&.net-pay-header, &.total-header': {
                  pl: spacing(1.25),
                },
              },
            },
            [`& .${gridClasses.row}`]: {
              [`& .${gridClasses.cell}`]: {
                '&.agrm-data-grid-cell': {
                  '&:not(.employee-cell, .employees-cell, .net-pay-cell, .total-cell)': {
                    p: `0 ${spacing(1.25)}`,
                  },
                  '&.employee-cell, &.employees-cell': {
                    pr: spacing(1.25),
                  },
                  '&.net-pay-cell, &.total-cell': {
                    pl: spacing(1.25),
                  },
                },
              },
            },
          })}
        />
      </Stack>
    </div>
  );
};

export default PayrollDetails;
