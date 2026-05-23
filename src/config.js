import { mainDrawerWidth } from 'lib/constants';
import { dmSans, inter, plusJakartaSans, roboto } from 'theme/typography';

export const fontFamilies = [
  plusJakartaSans.style.fontFamily,
  inter.style.fontFamily,
  roboto.style.fontFamily,
  dmSans.style.fontFamily,
];

export const initialConfig = {
  assetsDir: process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '',
  textDirection: 'ltr',
  navigationMenuType: 'sidenav',
  sidenavType: 'default',
  sidenavCollapsed: false,
  topnavType: 'default',
  navColor: 'default',
  openNavbarDrawer: false,
  drawerWidth: mainDrawerWidth.full,
  locale: 'en-US',
  themePreset: 'default-light',
  primaryColor: null,
  fontFamily: fontFamilies[0],
  fontSize: 16,
};
