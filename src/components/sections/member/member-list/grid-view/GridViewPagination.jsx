import TablePagination from '@mui/material/TablePagination';
import CustomTablePaginationAction from 'components/pagination/CustomTablePaginationAction';

const GridViewPagination = ({
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onShowAllClick = () => {},
}) => {
  const handleChangePage = (_, newPage) => {
    onPageChange(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };
  return (
    <TablePagination
      component="div"
      count={items}
      page={page}
      showFirstButton
      showLastButton
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      ActionsComponent={(props) => (
        <CustomTablePaginationAction
          showAllHref="#!"
          onShowAllClick={onShowAllClick}
          showFullPagination
          {...props}
        />
      )}
      sx={{ bgcolor: 'background.paper' }}
    />
  );
};
export default GridViewPagination;
