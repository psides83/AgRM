import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SearchTextField from 'components/common/SearchTextField';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';

const FaqPageHeader = () => {
  return (
    <Paper sx={{ px: { xs: 3, md: 5 }, py: 5 }}>
      <Stack
        sx={{
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'flex-end' },
          justifyContent: 'space-between',
        }}
      >
        <div>
          <PageBreadcrumb
            items={[
              { label: 'Misc', url: '#!' },
              { label: 'Faq', active: true },
            ]}
            sx={{ mb: 2 }}
          />
          <Typography variant="h4">Faq</Typography>
        </div>

        <SearchTextField
          placeholder="Search by keyword"
          sx={{ maxWidth: { sm: 400 }, width: 1 }}
          iconSx={{ color: 'text.secondary' }}
        />
      </Stack>
    </Paper>
  );
};

export default FaqPageHeader;
