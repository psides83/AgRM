'use client';

import { useCallback } from 'react';
import { Paper } from '@mui/material';
import { useGridApiRef } from '@mui/x-data-grid';
import DashboardMenu from 'components/common/DashboardMenu';
import SearchTextField from 'components/common/SearchTextField';
import SectionHeader from 'components/common/SectionHeader';
import ProductsTable from './ProductsTable';

const TopProducts = () => {
  const apiRef = useGridApiRef();

  const handleSearch = useCallback(
    (e) => {
      apiRef.current?.setQuickFilterValues([e.target.value]);
    },
    [apiRef],
  );

  return (
    <Paper sx={{ px: { xs: 3, md: 5 }, py: { xs: 3, md: 5 }, height: '100%' }}>
      <SectionHeader
        title="Top products"
        subTitle="Detailed information about the products"
        sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, columnGap: 1, rowGap: 3, mb: 3 }}
        actionComponent={
          <>
            <SearchTextField
              placeholder="Search"
              size="small"
              onChange={handleSearch}
              sx={() => ({
                maxWidth: { sm: 180, md: 260 },
                width: 1,
                ml: 'auto',
                order: { xs: 1, sm: 0 },
                flexBasis: { xs: '100%' },
              })}
            />
            <DashboardMenu size="small" />
          </>
        }
      />
      <ProductsTable apiRef={apiRef} />
    </Paper>
  );
};

export default TopProducts;
