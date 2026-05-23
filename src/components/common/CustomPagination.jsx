import { useState } from 'react';
import TablePagination from '@mui/material/TablePagination';
import CustomTablePaginationAction from 'components/pagination/CustomTablePaginationAction';

const CustomPagination = ({ count, sx, ...rest }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      showFirstButton
      showLastButton
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      ActionsComponent={(props) => (
        <CustomTablePaginationAction
          showAllHref="#!"
          onShowAllClick={() => {}}
          showFullPagination
          {...props}
        />
      )}
      sx={{ bgcolor: 'background.paper', ...sx }}
      {...rest}
    />
  );
};

export default CustomPagination;
