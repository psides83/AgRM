import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Link, Stack } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, gridClasses } from '@mui/x-data-grid';
import { productListAdmin } from 'data/e-commerce/products';
import useNumberFormat from 'hooks/useNumberFormat';
import paths from 'routes/paths';
import Image from 'components/base/Image';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

const getStatusBadgeColor = (val) => {
  switch (val) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'neutral';
    case 'draft':
      return 'warning';
    case 'archive':
      return 'error';
    default:
      return 'primary';
  }
};

const zeroPad = (num, places) => String(num).padStart(places, '0');

const defaultPageSize = 8;

const ProductsTable = ({ apiRef, filterButtonEl }) => {
  const { currencyFormat } = useNumberFormat();
  const { push } = useRouter();
  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'name',
        headerName: 'Name',
        headerClassName: 'name-header',
        cellClassName: 'name-cell',
        minWidth: 500,
        flex: 1,
        renderCell: (params) => {
          return (
            <Stack
              spacing={1.25}
              sx={{
                alignItems: 'center',
              }}
            >
              <Image
                src={params.row.image.src}
                alt={params.row.name}
                onClick={() => push(paths.productDetails(String(params.row.id)))}
                sx={{ cursor: 'pointer' }}
                height={48}
                width={48}
              />
              <Link
                href={paths.productDetails(String(params.row.id))}
                variant="subtitle2"
                sx={{ fontWeight: 400 }}
              >
                {params.row.name}
              </Link>
            </Stack>
          );
        },
      },
      {
        field: 'category',
        headerName: 'Category',
        headerClassName: 'category-header',
        cellClassName: 'category-cell',
        minWidth: 148,
        renderCell: (params) => {
          return <Chip label={params.row.category} variant="soft" color="neutral" />;
        },
      },
      {
        field: 'price',
        headerName: 'Price',
        headerClassName: 'price-header',
        cellClassName: 'price-cell',
        minWidth: 80,
        valueGetter: ({ discounted }) => discounted,
        renderCell: ({ row: { price } }) => currencyFormat(price.discounted),
      },
      {
        field: 'status',
        headerName: 'Status',
        headerClassName: 'status-header',
        cellClassName: 'status-cell',
        minWidth: 148,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.status}
              variant="soft"
              color={getStatusBadgeColor(params.row.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'stock',
        headerName: 'Inventory',
        headerClassName: 'stock-header',
        cellClassName: 'stock-cell',
        minWidth: 108,
        renderCell: (params) => zeroPad(params.row.stock, 2),
      },
      {
        field: 'vendor',
        headerName: 'Vendor',
        headerClassName: 'vendor-header',
        cellClassName: 'vendor-cell',
        minWidth: 200,
        renderCell: (params) => {
          return (
            <Link variant="subtitle2" href="#!" sx={{ fontWeight: 400 }}>
              {params.row.vendor}
            </Link>
          );
        },
      },
      {
        field: 'publishedAt',
        headerName: 'Published on',
        headerClassName: 'published-header',
        cellClassName: 'published-cell',
        minWidth: 130,
        filterable: false,
        renderCell: (params) => params.row.publishedAt,
      },
      {
        field: 'action',
        headerName: '',
        headerClassName: 'action-header',
        cellClassName: 'action-cell',
        filterable: false,
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [currencyFormat],
  );

  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={productListAdmin}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize, productListAdmin.length]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: defaultPageSize,
            },
          },
        }}
        checkboxSelection
        slots={{
          basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
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
                '&:not(.action-cell)': {
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
    </Box>
  );
};

export default ProductsTable;
