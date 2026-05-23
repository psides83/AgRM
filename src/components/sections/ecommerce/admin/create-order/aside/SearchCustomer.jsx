import { Box, Typography } from '@mui/material';
import SearchTextField from 'components/common/SearchTextField';

const SearchCustomer = () => {
  return (
    <Box
      sx={{
        width: 1,
        p: { xs: 3, md: 5 },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 2,
        }}
      >
        Search or create a customer
      </Typography>
      <SearchTextField variant="filled" fullWidth label="Search with name" />
    </Box>
  );
};

export default SearchCustomer;
