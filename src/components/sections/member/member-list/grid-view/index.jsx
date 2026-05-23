'use client';

import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import GridViewPagination from './GridViewPagination';
import MemberGridItem from './MemberGridItem';

const MembersGridView = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 1, gap: 4, pb: 5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(270px, 1fr))`,
            gap: 1,
          }}
        >
          {paginatedData.map((item) => (
            <MemberGridItem key={item.id} data={item} sx={{ width: 1 }} />
          ))}
        </Box>

        <GridViewPagination
          items={data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onShowAllClick={() => {
            if (rowsPerPage === data.length) setRowsPerPage(10);
            else setRowsPerPage(data.length);
            setPage(0);
          }}
        />
      </Box>
    </Box>
  );
};

export default MembersGridView;
