import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDealsContext } from 'providers/DealsProvider';
import { SET_CREATE_DEAL_DIALOG } from 'reducers/DealsReducer';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from 'components/common/SearchTextField';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';

const breadcrumbItems = [
  {
    label: 'Home',
    url: '/',
  },
  {
    label: 'CRM',
    url: paths.crm,
  },
  {
    label: 'Deals',
    url: '#!',
    active: true,
  },
];

const DealsHeader = () => {
  const { dealsDispatch } = useDealsContext();
  const handleSearch = (e) => {
    console.log(e.target.value);
  };

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 2 }}>
      <PageBreadcrumb items={breadcrumbItems} sx={{ mb: 2 }} />
      <Stack spacing={1} sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <Typography variant="h4">Deals</Typography>
        <SearchTextField
          placeholder="Search Tasks"
          onChange={handleSearch}
          fullWidth
          sx={{
            ml: 'auto',
            order: { xs: 1, sm: 0 },
            maxWidth: { xs: 1, sm: 300 },
            minWidth: 150,
          }}
          iconSx={{ color: 'text.secondary' }}
        />
        <Button variant="soft" color="neutral" sx={{ flexShrink: 0, ml: { xs: 'auto', sm: 0 } }}>
          Import
        </Button>
        <Button
          size="medium"
          variant="contained"
          startIcon={
            <IconifyIcon
              icon="material-symbols:add-2-rounded"
              sx={{ fontSize: '18px !important' }}
            />
          }
          onClick={() => dealsDispatch({ type: SET_CREATE_DEAL_DIALOG, payload: { isOpen: true } })}
          sx={{ flexShrink: 0 }}
        >
          New Deal
        </Button>
      </Stack>
    </Box>
  );
};

export default DealsHeader;
