import { typographyClasses } from '@mui/material/Typography';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import SearchFilterActionBar from 'components/sections/hrm/payroll/common/SearchFilterActionBar';
import NewAppraisalCycle from './new-appraisal-cycle';

const AppraisalCycleHeader = () => {
  return (
    <PageHeader
      title="Appraisal Cycle"
      breadcrumb={[
        { label: 'Home', url: '#!' },
        { label: 'Appraisal Cycle', active: true },
      ]}
      actionComponent={
        <SearchFilterActionBar
          searchPlaceholder="Search Cycle"
          searchId="searchItem"
          actionComponent={<NewAppraisalCycle />}
          searchSx={{ maxWidth: { sm: 250 } }}
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
  );
};

export default AppraisalCycleHeader;
