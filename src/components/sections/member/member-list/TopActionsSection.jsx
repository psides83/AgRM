import { Box, Button, Stack, Tab, Tabs, styled, tabClasses, tabsClasses } from '@mui/material';
import { cssVarRgba } from 'lib/utils';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from 'components/common/SearchTextField';

const TopActionsSection = ({ tab, handleChange, toggleDrawer }) => {
  const { only } = useBreakpoints();
  const onlyXs = only('xs');
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      gap={1.5}
      justifyContent="space-between"
      alignItems={{ lg: 'center' }}
      sx={{ width: 1 }}
    >
      <SearchTextField
        placeholder="Search member"
        fullWidth
        sx={{
          maxWidth: { sm: 300, md: 255, xl: 230 },
          flexGrow: 1,
          flexShrink: { xs: 0, sm: 1, lg: 0 },
        }}
      />

      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        sx={{
          flexShrink: 0,
          flexGrow: 1,
          alignSelf: { xs: 'stretch', lg: 'auto' },
          justifyContent: { xs: 'space-between', lg: 'flex-end' },
        }}
      >
        <Button
          variant="soft"
          color="neutral"
          shape={onlyXs ? 'square' : undefined}
          onClick={toggleDrawer}
          sx={{
            flexShrink: 0,
            gap: 0.5,
            mr: 'auto',
          }}
        >
          <IconifyIcon icon="material-symbols:filter-alt-outline" sx={{ fontSize: 20 }} />
          {!onlyXs && <Box component="span">Filter</Box>}
        </Button>
        <StyledTabs value={tab} onChange={handleChange}>
          <Tab
            value="list"
            label={!onlyXs ? 'List' : undefined}
            disableRipple
            icon={<IconifyIcon icon="material-symbols-light:lists-rounded" sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            value="grid"
            label={!onlyXs ? 'Grid' : undefined}
            disableRipple
            icon={
              <IconifyIcon
                icon="material-symbols-light:grid-view-outline-rounded"
                sx={{ fontSize: 18 }}
              />
            }
            iconPosition="start"
          />
          <Tab
            value="org-chart"
            label={!onlyXs ? 'Org chart' : undefined}
            disableRipple
            icon={
              <IconifyIcon
                icon="material-symbols-light:account-tree-outline-rounded"
                sx={{ fontSize: 18 }}
              />
            }
            iconPosition="start"
          />
        </StyledTabs>

        <Button variant="soft" color="neutral" sx={{ flexShrink: 0 }}>
          Export
        </Button>
      </Stack>
    </Stack>
  );
};
const StyledTabs = styled(Tabs)(({ theme }) => ({
  padding: theme.spacing(0.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  flexShrink: 0,
  backgroundColor: theme.vars.palette.background.elevation1,
  [`& .${tabsClasses.list}`]: { gap: 0 },
  [`& .${tabsClasses.indicator}`]: {
    height: '100%',
    backgroundColor: cssVarRgba(theme.vars.palette.primary.mainChannel, 0.15),
    borderRadius: Number(theme.shape.borderRadius) * 2,
  },
  [`& .${tabClasses.root}`]: {
    color: theme.vars.palette.text.primary,
    fontWeight: 600,
    textTransform: 'none',
    maxHeight: '30px',
    minHeight: '30px',
    gap: theme.spacing(0.5),
    paddingLeft: theme.spacing(1.25),
    paddingRight: theme.spacing(1.25),
    [`&>.${tabClasses.icon}`]: { marginRight: 0, '&.iconify': { fontSize: '18px' } },
    [`&.${tabClasses.selected}`]: { color: theme.vars.palette.primary.dark },
  },
}));
export default TopActionsSection;
