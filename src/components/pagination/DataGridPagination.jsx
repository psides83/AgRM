'use client';

import { TablePagination, useEventCallback } from '@mui/material';
import DataGridPaginationAction from './DataGridPaginationAction';
import TableLabelDisplayedRows from './TableLabelDisplayedRows';

const DataGridPagination = function BasePagination({ ref, ...props }) {
  const { onRowsPerPageChange, disabled, showFullPagination = false, showAllHref, ...rest } = props;

  return (
    <TablePagination
      ref={ref}
      showFirstButton
      showLastButton
      component="div"
      ActionsComponent={(props) => {
        return (
          <DataGridPaginationAction
            showFullPagination={showFullPagination}
            showAllHref={showAllHref}
            {...props}
          />
        );
      }}
      onRowsPerPageChange={useEventCallback((event) => {
        onRowsPerPageChange?.(Number(event.target.value));
      })}
      labelDisplayedRows={TableLabelDisplayedRows}
      {...rest}
    />
  );
};

export default DataGridPagination;
