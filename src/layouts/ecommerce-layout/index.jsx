'use client';

import { useEffect, useRef } from 'react';
import { Box, Drawer, drawerClasses, Stack, Toolbar } from '@mui/material';
import useSettingsPanelMountEffect from 'hooks/useSettingsPanelMountEffect';
import NavProvider from 'layouts/main-layout/NavProvider';
import Footer from 'layouts/main-layout/footer';
import SidenavDrawerContent from 'layouts/main-layout/sidenav/SidenavDrawerContent';
import { mainDrawerWidth } from 'lib/constants';
import EcommerceProvider from 'providers/EcommerceProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { mutate } from 'swr';
import { sidenavVibrantStyle } from 'theme/styles/vibrantNav';
import VibrantBackground from 'components/common/VibrantBackground';
import EcommerceFooter from './EcommerceFooter';
import EcommerceAppbar from './app-bar';

const EcommerceLayout = ({ children }) => {
  const {
    config: { navColor, openNavbarDrawer },
    setConfig,
  } = useSettingsContext();

  const navColorRef = useRef(navColor);

  const toggleNavbarDrawer = () => {
    setConfig({
      openNavbarDrawer: !openNavbarDrawer,
    });
  };

  useSettingsPanelMountEffect({
    disableNavigationMenuSection: true,
    disableSidenavShapeSection: true,
    disableTopShapeSection: true,
    disableNavColorSection: true,
  });

  useEffect(() => {
    setConfig({
      navColor: 'default',
    });

    return () => {
      setConfig({
        navColor: navColorRef.current,
      });
      // Clear the cache when the user navigates to a different layout
      mutate((key) => Array.isArray(key) && key[0].startsWith('e-commerce'), undefined, {
        revalidate: true,
      });
    };
  }, []);

  return (
    <EcommerceProvider>
      <NavProvider>
        <Box sx={{ width: 1 }}>
          <Stack
            direction="column"
            sx={{
              p: 0,
              minHeight: '100vh',
              width: 1,
            }}
          >
            <EcommerceAppbar />
            <Drawer
              variant="temporary"
              open={openNavbarDrawer}
              onClose={toggleNavbarDrawer}
              ModalProps={{
                keepMounted: true,
              }}
              sx={[
                {
                  display: 'block',
                  [`& .${drawerClasses.paper}`]: {
                    pt: 3,
                    boxSizing: 'border-box',
                    width: mainDrawerWidth.full,
                  },
                },
                navColor === 'vibrant' && sidenavVibrantStyle,
              ]}
            >
              {navColor === 'vibrant' && <VibrantBackground position="side" />}
              <SidenavDrawerContent variant="temporary" />
            </Drawer>
            <Stack direction="column" component="main" sx={{ flex: 1 }}>
              <Toolbar
                sx={{
                  minHeight: (theme) => theme.mixins.ecommerceTopbar,
                }}
              />
              {children}
            </Stack>
            <EcommerceFooter />
            <Footer />
          </Stack>
        </Box>
      </NavProvider>
    </EcommerceProvider>
  );
};

export default EcommerceLayout;
