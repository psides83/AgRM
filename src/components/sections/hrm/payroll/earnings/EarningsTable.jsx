import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid/colDef';
import { gridClasses } from '@mui/x-data-grid/constants';
import useNumberFormat from 'hooks/useNumberFormat';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import {
  renderDeductionCell,
  renderEmployeeCell,
  renderExtraPayCell,
  renderHoursCell,
  renderNetPayTypeCell,
} from './RenderCells';

const EarningsTable = ({ apiRef, filterButtonEl, data }) => {
  const { currencyFormat } = useNumberFormat();
  const { up } = useBreakpoints();

  const upSm = up('sm');

  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
        sortable: false,
      },
      {
        field: 'employee',
        headerName: 'Employees',
        headerClassName: 'employee-header',
        cellClassName: 'employee-cell',
        flex: 1.2,
        minWidth: 220,
        valueGetter: ({ name }) => name,
        renderCell: (params) => renderEmployeeCell(params),
      },
      {
        field: 'hours',
        headerName: 'Hours',
        headerClassName: 'hours-header',
        cellClassName: 'hours-cell',
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: (params) => renderHoursCell(params),
      },
      {
        field: 'extraPay',
        headerName: 'Extra Pay',
        headerClassName: 'extra-pay-header',
        cellClassName: 'extra-pay-cell',
        flex: 1.6,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => renderExtraPayCell(params, apiRef),
      },
      {
        field: 'deduction',
        headerName: 'Deduction',
        headerClassName: 'deduction-header',
        cellClassName: 'deduction-cell',
        flex: 1.6,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => renderDeductionCell(params, apiRef),
      },
      {
        field: 'netPayType',
        headerName: 'Net & Pay Type',
        headerClassName: 'net-pay-type-header',
        cellClassName: 'net-pay-type-cell',
        flex: 1,
        minWidth: 180,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: (params) => renderNetPayTypeCell(params, apiRef),
      },
      {
        field: 'action',
        headerAlign: 'right',
        headerClassName: 'action-header',
        cellClassName: 'action-cell',
        align: 'right',
        filterable: false,
        editable: false,
        sortable: false,
        width: 80,
        minWidth: 80,
        renderHeader: () => <DashboardMenu />,
        renderCell: () => <DashboardMenu />,
      },
    ],
    [currencyFormat, data, apiRef],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: 1 }}>
      <DataGrid
        apiRef={apiRef}
        columns={columns}
        rows={data}
        checkboxSelection
        disableColumnMenu
        getRowHeight={() => 'auto'}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 7,
            },
          },
        }}
        pageSizeOptions={[7, data.length]}
        slots={{
          basePagination: (props) => (
            <DataGridPagination showFullPagination={upSm} showAllHref="#!" {...props} />
          ),
        }}
        slotProps={{
          panel: {
            target: filterButtonEl,
          },
        }}
        sx={({ spacing }) => ({
          [`& .${gridClasses.columnHeaders}`]: {
            minWidth: 1,
            [`& .${gridClasses.columnHeader}`]: {
              '&:not(.action-header)': {
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
                alignItems: 'flex-start',
                '&:not(.action-cell)': {
                  p: `${spacing(1)} ${spacing(1.25)}`,
                },
                '&.action-cell': {
                  pl: spacing(1.25),
                  py: spacing(1),
                },
              },
            },
          },
        })}
      />
    </Box>
  );
};

export default EarningsTable;
