import {
  formControlClasses,
  inputBaseClasses,
  inputLabelClasses,
  tablePaginationClasses,
} from '@mui/material';
import { gridClasses } from '@mui/x-data-grid/constants';
import { cssVarRgba } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';
import DataGridPagination from 'components/pagination/DataGridPagination';

const DataGrid = {
  defaultProps: {
    disableRowSelectionOnClick: true,
    disableColumnMenu: true,
    columnHeaderHeight: 48,
    getCellClassName: () => 'agrm-data-grid-cell',
    slots: {
      columnSortedDescendingIcon: ({ onLoad, ...props }) => (
        <IconifyIcon icon="material-symbols:sort-rounded" {...props} />
      ),
      columnSortedAscendingIcon: ({ onLoad, ...props }) => (
        <IconifyIcon
          icon="material-symbols:sort-rounded"
          {...props}
          sx={{ transform: 'rotateX(180deg)' }}
        />
      ),
      basePagination: DataGridPagination,
    },
    slotProps: {
      filterPanel: {
        filterFormProps: {
          columnInputProps: {
            variant: 'outlined',
          },
          valueInputProps: {
            InputComponentProps: {
              variant: 'outlined',
            },
          },
          operatorInputProps: {
            variant: 'outlined',
          },
          logicOperatorInputProps: {
            variant: 'outlined',
          },
        },
      },
    },
  },
  styleOverrides: {
    root: ({ theme }) => ({
      border: 'none',
      overflow: 'unset',
      [`& .${gridClasses.filler}`]: {
        '--DataGrid-rowBorderColor': 'transparent',
      },
      '--DataGrid-rowBorderColor': theme.vars.palette.dividerLight,
    }),
    panel: ({ theme }) => ({
      [`& .${gridClasses.paper}`]: {
        borderRadius: theme.spacing(2),
        outline: 'none',
        background: theme.vars.palette.background.menu,
        border: '1px solid',
        borderColor: theme.vars.palette.menuDivider,
        boxShadow: theme.vars.shadows[3],
        padding: 0,
      },
    }),
    panelContent: {
      padding: 0,
    },
    filterForm: ({ theme }) => ({
      gap: theme.spacing(1),
      padding: theme.spacing(3),
      flexDirection: 'column',
      [`& .${formControlClasses.root}`]: {
        width: '100%',
        [`& .${inputBaseClasses.root}`]: {
          width: '100%',
        },
        [`& .${inputLabelClasses.root}`]: {
          fontWeight: 500,
          transform: 'translate(14px, -9px) scale(0.75) !important',
          [`&.${inputLabelClasses.shrink}`]: {
            transform: 'translate(14px, -9px) scale(0.75) !important',
          },
          [`&.${inputLabelClasses.sizeSmall}`]: {
            transform: 'translate(12px, -9px) scale(0.75) !important',
          },
          '&.MuiInputLabel-sizeLarge': {
            transform: 'translate(18px, -9px) scale(0.75) !important',
          },
        },
      },
    }),
    filterFormDeleteIcon: ({ theme }) => ({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      '&::before': {
        content: '"Filter"',
        color: theme.vars.palette.text.primary,
        fontWeight: 600,
        fontSize: theme.typography.subtitle1.fontSize,
      },
    }),
    main: {
      overflow: 'unset',
    },
    columnHeaders: ({ theme }) => ({
      '--DataGrid-t-header-background-base': theme.vars.palette.background.elevation1,
      overflow: 'hidden',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    }),
    columnHeaderTitleContainer: {
      overflow: 'unset',
      [`& .${gridClasses.columnHeaderTitleContainerContent}`]: {
        overflow: 'unset',
      },
    },
    row: ({ theme }) => ({
      [`&.${gridClasses['row--firstVisible']}`]: { '--rowBorderColor': 'transparent' },
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&.Mui-selected': {
        backgroundColor: cssVarRgba(theme.vars.palette.primary.lightChannel, 0.08),
      },
      [`& .${gridClasses.cell}`]: {
        '&.agrm-data-grid-cell': {
          padding: `0 ${theme.spacing(3)}`,
          [`&.${gridClasses.cellCheckbox}`]: {
            padding: 0,
          },
        },
      },
    }),
    columnHeader: ({ theme }) => ({
      padding: `0 ${theme.spacing(3)}`,
      [`&.${gridClasses.columnHeaderCheckbox}`]: {
        padding: 0,
      },
      borderBottom: `0 !important`,
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    }),
    columnSeparator: {
      display: 'none',
    },
    cell: ({ theme }) => ({
      lineHeight: 'unset',
      display: 'flex',
      alignItems: 'center',
      color: theme.vars.palette.text.secondary,
      ...theme.typography.subtitle2,
      fontWeight: 400,
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    }),
    cellCheckbox: {
      width: 64,
    },
    cellEmpty: {
      padding: 0,
    },
    columnHeaderCheckbox: {
      width: '64px !important',
    },
    virtualScroller: {
      '@supports (-moz-appearance:none)': {
        scrollbarWidth: 'thin',
        overflowY: 'hidden',
      },
    },

    sortIcon: ({ theme }) => ({
      color: theme.vars.palette.text.primary,
    }),
    selectedRowCount: { display: 'none' },
    footerContainer: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.elevation1,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      border: 'none',
      [`& .${tablePaginationClasses.root}`]: {
        flex: 1,
      },
    }),
    filler: {
      height: 0,
      border: 'none',
    },
    toolbar: {
      borderBottomWidth: 0,
    },
  },
};

export default DataGrid;
