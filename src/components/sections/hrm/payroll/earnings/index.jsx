import { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useGridApiRef } from '@mui/x-data-grid';
import { earningsDeductions } from 'data/hrm/payroll';
import BottomActions from './BottomActions';
import EarningsTable from './EarningsTable';
import TopSection from './TopSection';

const EarningsDeductionsMain = () => {
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
    <Paper sx={{ p: { xs: 3, md: 5 } }}>
      <Grid container spacing={5}>
        <Grid size={12} container spacing={4}>
          <Grid size={12}>
            <TopSection
              handleSearch={handleSearch}
              handleToggleFilterPanel={handleToggleFilterPanel}
            />
          </Grid>
          <Grid size={12}>
            <EarningsTable
              apiRef={apiRef}
              data={earningsDeductions}
              filterButtonEl={filterButtonEl}
            />
          </Grid>
        </Grid>
        <Grid size={12}>
          <BottomActions />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EarningsDeductionsMain;
