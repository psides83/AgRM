'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { typographyClasses } from '@mui/material/Typography';
import { useGridApiRef } from '@mui/x-data-grid';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import SearchFilterActionBar from 'components/sections/hrm/payroll/common/SearchFilterActionBar';
import ListTable from 'components/sections/hrm/performance-management/appraisal-list/ListTable';
import AddMember from 'components/sections/hrm/performance-management/appraisal-list/add-member';

const AppraisalList = () => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const apiRef = useGridApiRef();

  const handleSearch = useCallback(
    (e) => apiRef.current?.setQuickFilterValues([e.target.value]),
    [apiRef],
  );

  const handleToggleFilterPanel = (e) => {
    const clickedEl = e.currentTarget;

    if (filterButtonEl && filterButtonEl === clickedEl) {
      setFilterButtonEl(null);
      apiRef.current?.hideFilterPanel();

      return;
    }

    setFilterButtonEl(clickedEl);
    apiRef.current?.showFilterPanel();
  };

  return (
    <Paper sx={{ height: 1 }}>
      <PageHeader
        title="Appraisal List"
        breadcrumb={[
          { label: 'Home', url: '#!' },
          { label: 'Appraisal List', active: true },
        ]}
        actionComponent={
          <SearchFilterActionBar
            searchPlaceholder="Search Employee"
            onSearchChange={handleSearch}
            onFilterClick={handleToggleFilterPanel}
            actionComponent={<AddMember />}
          />
        }
        paperProps={{
          sx: {
            outline: 0,
            [`& .${typographyClasses.h4}`]: {
              textWrap: 'nowrap',
            },
          },
        }}
        sx={{
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'flex-end' },
        }}
      />
      <Box
        sx={{
          pt: 3,
          pb: { xs: 3, md: 5 },
          px: { xs: 3, md: 5 },
        }}
      >
        <ListTable apiRef={apiRef} filterButtonEl={filterButtonEl} />
      </Box>
    </Paper>
  );
};

export default AppraisalList;
