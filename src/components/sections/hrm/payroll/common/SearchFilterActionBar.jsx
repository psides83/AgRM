import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from 'components/common/SearchTextField';

const SearchFilterActionBar = ({
  searchPlaceholder,
  searchId,
  onSearchChange,
  onFilterClick,
  actionComponent,
  searchSx,
  sx,
  ...rest
}) => {
  return (
    <Grid
      container
      spacing={2}
      {...rest}
      sx={{
        width: { xs: 1, md: 'auto' },
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
        ...sx,
      }}
    >
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <Stack direction="row" gap={1} alignItems="center" sx={{ width: 1, minWidth: 0 }}>
          <SearchTextField
            placeholder={searchPlaceholder}
            fullWidth
            id={searchId}
            onChange={onSearchChange}
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: { sm: 350 },
              ml: { md: 'auto' },
              ...searchSx,
            }}
          />
          <Button
            variant="soft"
            color="neutral"
            startIcon={<IconifyIcon icon="material-symbols:filter-alt-outline" />}
            onClick={onFilterClick}
            sx={{ textWrap: 'nowrap', flexShrink: 0 }}
          >
            Filter
          </Button>
        </Stack>
      </Grid>
      {actionComponent != null ? (
        <Grid size={{ xs: 12, sm: 'auto' }}>{actionComponent}</Grid>
      ) : null}
    </Grid>
  );
};

export default SearchFilterActionBar;
