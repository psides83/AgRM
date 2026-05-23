'use client';

import useSettingsPanelMountEffect from 'hooks/useSettingsPanelMountEffect';

const AuthLayout = ({ children }) => {
  useSettingsPanelMountEffect({
    disableNavigationMenuSection: true,
    disableSidenavShapeSection: true,
    disableTopShapeSection: true,
    disableNavColorSection: true,
  });

  return children;
};

export default AuthLayout;
