import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import useNumberFormat from 'hooks/useNumberFormat';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import DataGridPagination from 'components/pagination/DataGridPagination';
import TableLabelDisplayedRows from 'components/pagination/TableLabelDisplayedRows';
import ActivityChart from './ActivityChart';

const getJSSResponseColor = (value, vars) => {
  const colors = {
    neutral: { color: 'primary.main', barColor: vars.palette.chBlue[200] },
    satisfied: { color: 'success.main', barColor: vars.palette.chGreen[200] },
    unsatisfied: { color: 'warning.main', barColor: vars.palette.chOrange[200] },
    upset: { color: 'error.main', barColor: vars.palette.chRed[300] },
  };

  return colors[value] || { color: 'text.disabled', barColor: vars.palette.chGrey[50] };
};

const ResignationsTable = ({ tableData }) => {
  const { currencyFormat, numberFormat } = useNumberFormat();
  const { up } = useBreakpoints();
  const { vars } = useTheme();
  const upLg = up('lg');

  const columns = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID no.',
        headerClassName: 'resignation-id-header',
        cellClassName: 'resignation-id-cell',
        width: 100,
      },
      {
        field: 'profile',
        headerName: 'Name',
        headerClassName: 'profile-header',
        cellClassName: 'profile-cell',
        minWidth: 220,
        flex: 2,
        valueGetter: ({ name }) => name,
        renderCell: (params) => {
          return (
            <div>
              <Typography component={Link} href={params.row.profile.link} variant="body2">
                {params.row.profile.name}
              </Typography>
              <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {params.row.profile.role}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {params.row.profile.branch}
                </Typography>
              </Stack>
            </div>
          );
        },
        sortComparator: (v1, v2) => v1.localeCompare(v2),
      },
      {
        field: 'reason',
        headerName: 'Reason',
        headerClassName: 'reason-header',
        cellClassName: 'reason-cell',
        minWidth: 180,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        flex: 1.5,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {params.row.reason}
          </Typography>
        ),
      },
      {
        field: 'jssResponse',
        headerName: 'JSS Response',
        headerClassName: 'jss-response-header',
        cellClassName: 'jss-response-cell',
        minWidth: 120,
        flex: 1,
        valueGetter: ({ status }) => status,
        renderCell: (params) => {
          const { status, response } = params.row.jssResponse;

          return (
            <div>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: getJSSResponseColor(status, vars).color,
                }}
              >
                {status}
              </Typography>
              <Stack
                sx={(theme) => ({
                  mt: 0.5,
                  gap: 0.25,
                  height: 8,
                  width: 100,
                  bgcolor: theme.vars.palette.chGrey[50],
                  border: `1px solid ${theme.vars.palette.chGrey[50]}`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  alignItems: 'center',
                })}
              >
                {response.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      width: `${item.value}%`,
                      height: 1,
                      bgcolor: getJSSResponseColor(item.label, vars).barColor,
                      '&:last-child': {
                        borderTopRightRadius: 2,
                        borderBottomRightRadius: 2,
                      },
                    }}
                  />
                ))}
              </Stack>
            </div>
          );
        },
        sortComparator: (v1, v2) => v1.localeCompare(v2),
      },
      {
        field: 'lastSalary',
        headerName: 'Last Salary',
        headerClassName: 'last-salary-header',
        cellClassName: 'last-salary-cell',
        minWidth: 170,
        align: 'right',
        headerAlign: 'right',
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {currencyFormat(params.row.lastSalary, { maximumFractionDigits: 0 })}
          </Typography>
        ),
      },
      {
        field: 'activity',
        headerName: 'Activity tracking',
        headerClassName: 'activity-header',
        cellClassName: 'activity-cell',
        minWidth: 200,
        align: 'right',
        headerAlign: 'right',
        flex: 2,
        valueGetter: ({ average }) => average,
        renderCell: (params) => (
          <Stack sx={{ gap: 2, alignItems: 'center' }}>
            <ActivityChart
              data={params.row.activity.details}
              sx={{ height: '16px !important', width: 70 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {params.row.activity.average}
            </Typography>
          </Stack>
        ),
        sortComparator: (v1, v2) => v1.localeCompare(v2),
      },
    ],
    [currencyFormat, numberFormat],
  );

  return (
    <Stack direction="column" sx={{ width: '100%' }}>
      <DataGrid
        rowHeight={64}
        rows={tableData}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5, tableData.length]}
        slots={{
          basePagination: (props) => (
            <DataGridPagination
              showAllHref="#!"
              labelDisplayedRows={upLg ? TableLabelDisplayedRows : () => null}
              {...props}
            />
          ),
        }}
        sx={({ spacing }) => ({
          [`& .${gridClasses.columnHeaders}`]: {
            [`& .${gridClasses.columnHeader}`]: {
              '&:not(.resignation-id-header, .activity-header)': {
                p: `0 ${spacing(1.25)}`,
              },
              '&.resignation-id-header': {
                pr: spacing(1.25),
              },
              '&.activity-header': {
                pl: spacing(1.25),
              },
            },
          },
          [`& .${gridClasses.row}`]: {
            [`& .${gridClasses.cell}`]: {
              '&.agrm-data-grid-cell': {
                '&:not(.resignation-id-cell, .activity-cell)': {
                  p: `0 ${spacing(1.25)}`,
                },
                '&.resignation-id-cell': {
                  pr: spacing(1.25),
                },
                '&.activity-cell': {
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

export default ResignationsTable;
