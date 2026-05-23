'use client';

import { Drawer, drawerClasses } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import FilterDrawerContent from './FilterDrawerContent';

const FilterDrawer = ({ open, handleClose, drawerWidth }) => {
  const { up } = useBreakpoints();
  const { topbarHeight } = useNavContext();
  const upXl = up('xl');
  const upSm = up('sm');

  return (
    <>
      {upXl ? (
        <Drawer
          variant="persistent"
          open={open}
          sx={(theme) => ({
            flexShrink: 0,
            display: { xs: 'none', xl: 'block' },
            [`& .${drawerClasses.paper}`]: {
              position: 'sticky',
              zIndex: 'unset',
              top: theme.mixins.topOffset(topbarHeight),
              height: theme.mixins.contentHeight(
                topbarHeight,
                (upSm ? theme.mixins.footer.sm : theme.mixins.footer.xs) + 1,
              ),
              border: 0,
              overflowY: 'auto',
              width: drawerWidth,
              outline: `1px solid ${theme.vars.palette.divider}`,
              bgcolor: theme.vars.palette.background.elevation1,
            },
          })}
        >
          <FilterDrawerContent handleClose={handleClose} />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleClose}
          ModalProps={{
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
          }}
          disablePortal
          sx={(theme) => ({
            display: { xs: 'block', xl: 'none' },
            [`& .${drawerClasses.paper}`]: {
              width: drawerWidth,
              border: 0,
              zIndex: theme.zIndex.drawer,
              outline: `1px solid ${theme.vars.palette.divider}`,
              bgcolor: theme.vars.palette.background.elevation1,
            },
          })}
        >
          <FilterDrawerContent handleClose={handleClose} />
        </Drawer>
      )}
    </>
  );
};

export default FilterDrawer;
