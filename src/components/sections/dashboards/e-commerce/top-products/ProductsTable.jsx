import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarGroup, Chip, Link, Stack, Tooltip, avatarClasses } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, gridClasses } from '@mui/x-data-grid';
import { topProducts } from 'data/e-commerce/dashboard';
import useNumberFormat from 'hooks/useNumberFormat';
import paths from 'routes/paths';
import Image from 'components/base/Image';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

const getStockBadge = (val) => {
  switch (val) {
    case 'In Stock':
      return {
        color: 'success',
        icon: 'ic:round-check',
      };
    case 'Low Stock':
      return {
        color: 'warning',
        icon: 'material-symbols:warning-outline-rounded',
      };
    case 'Stockout':
      return {
        color: 'error',
        icon: 'ic:round-do-not-disturb-alt',
      };

    default:
      return {
        color: 'primary',
        icon: 'material-symbols:check-small-rounded',
      };
  }
};

const ProductsTable = ({ apiRef }) => {
  const { currencyFormat, numberFormat } = useNumberFormat();
  const { push } = useRouter();
  const columns = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'product',
        headerName: 'Product',
        headerClassName: 'product-header',
        cellClassName: 'product-cell',
        width: 300,
        valueGetter: ({ name }) => name,
        renderCell: (params) => {
          return (
            <Stack
              spacing={1.25}
              sx={{
                alignItems: 'center',
              }}
            >
              <Image
                src={params.row.product.image}
                alt={params.row.product.name}
                onClick={() => push(paths.productDetails(String(params.row.id)))}
                sx={{ cursor: 'pointer' }}
                height={48}
                width={48}
              />
              <Link
                href={paths.productDetails(String(params.row.id))}
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.product.name}
              </Link>
            </Stack>
          );
        },
      },
      {
        field: 'vendor',
        headerName: 'Vendors',
        headerClassName: 'vendor-header',
        cellClassName: 'vendor-cell',
        minWidth: 150,
        flex: 0.35,
        sortable: false,
        renderCell: (params) => (
          <AvatarGroup
            max={5}
            color="primary"
            sx={{
              display: 'inline-flex',
              [`& .${avatarClasses.root}`]: {
                width: 28,
                height: 28,
                fontSize: 12.8,
                fontWeight: 'medium',
                backgroundColor: 'primary.main',
              },
            }}
          >
            {params.row.vendors.map((v) => (
              <Tooltip title={v.name} key={v.name}>
                <Avatar alt={v.name} src={v.avatar} />
              </Tooltip>
            ))}
          </AvatarGroup>
        ),
      },
      {
        field: 'margin',
        headerName: 'Margin',
        headerClassName: 'margin-header',
        cellClassName: 'margin-cell',
        flex: 0.2,
        minWidth: 120,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => currencyFormat(params.row.margin),
      },
      {
        field: 'sold',
        headerName: 'Sold',
        headerClassName: 'sold-header',
        cellClassName: 'sold-cell',
        minWidth: 110,
        flex: 0.2,

        renderCell: (params) => numberFormat(params.row.sold),
      },
      {
        field: 'stock',
        headerName: 'Stock',
        headerClassName: 'stock-header',
        cellClassName: 'stock-cell',
        minWidth: 120,
        flex: 0.25,
        align: 'center',
        headerAlign: 'right',
        renderCell: (params) => (
          <Chip
            label={params.row.stock}
            color={getStockBadge(params.row.stock)?.color}
            variant="soft"
            size="small"
            sx={{
              width: '100%',
              maxWidth: 118,
            }}
          />
        ),
      },
      {
        field: 'action',
        headerName: '',
        headerClassName: 'action-header',
        cellClassName: 'action-cell',
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [currencyFormat, numberFormat],
  );

  return (
    <Stack direction="column" sx={{ width: '100%' }}>
      <DataGrid
        rowHeight={64}
        rows={topProducts}
        apiRef={apiRef}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 6,
            },
          },
        }}
        pageSizeOptions={[6, topProducts.length]}
        checkboxSelection
        slots={{
          basePagination: (props) => <DataGridPagination showAllHref="#!" {...props} />,
        }}
        sx={({ spacing }) => ({
          [`& .${gridClasses.columnHeaders}`]: {
            [`& .${gridClasses.columnHeader}`]: {
              '&:not(.action-header)': {
                p: `0 ${spacing(1.25)}`,
              },
              '&.action-header': {
                pl: spacing(1.25),
              },
              '&.margin-header': {
                pr: spacing(5),
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
                '&.margin-cell': {
                  pr: spacing(5),
                },
              },
            },
          },
        })}
      />
    </Stack>
  );
};

export default ProductsTable;
