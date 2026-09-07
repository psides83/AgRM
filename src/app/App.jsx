'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useConfigFromQuery } from 'hooks/useConfigFromQuery';
import SettingsPanelProvider from 'providers/SettingsPanelProvider';
import SettingsPanel from 'components/settings-panel/SettingsPanel';

const SettingPanelToggler = dynamic(() => import('components/settings-panel/SettingPanelToggler'), {
  ssr: false,
});

const App = ({ children }) => {
  const pathname = usePathname();

  useConfigFromQuery();

  const isShowcase = pathname.startsWith('/showcase');
  const showTemplateSettings = process.env.NEXT_PUBLIC_ENABLE_TEMPLATE_SETTINGS === 'true';

  useEffect(() => {
    window.scrollTo(0, 0);

    if (isShowcase) {
      document.documentElement.style.overscrollBehavior = 'none';
      document.documentElement.style.filter = 'none';
    }

    return () => {
      document.documentElement.style.overscrollBehavior = 'auto';
      document.documentElement.style.filter = 'auto';
    };
  }, [pathname, isShowcase]);

  // useLayoutEffect(() => {
  //   configDispatch({ type: REFRESH });
  // }, [mode]);

  return (
    <SettingsPanelProvider>
      {isShowcase && (
        <style>{`
          html[data-vision="protanopia"],
          html[data-vision="deuteranopia"],
          html[data-vision="tritanopia"],
          html[data-vision="achromatopsia"] {
            filter: none !important;
          }
        `}</style>
      )}
      {children}
      {!isShowcase && showTemplateSettings && (
        <>
          <SettingsPanel />
          <SettingPanelToggler />
        </>
      )}
    </SettingsPanelProvider>
  );
};

export default App;
