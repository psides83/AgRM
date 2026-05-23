'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FormControlLabel, Radio } from '@mui/material';
import { useSettingsPanelContext } from 'providers/SettingsPanelProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_SIDENAV_SHAPE } from 'reducers/SettingsReducer';
import SettingsItem from './SettingsItem';
import SettingsPanelRadioGroup from './SettingsPanelRadioGroup';
import { SidenavDefaultIllustration } from './panel-illustrations/SidenavDefaultIllustration';
import { SlimIllustration } from './panel-illustrations/SlimIllustration';
import { StackedIllustration } from './panel-illustrations/StackedIllustration';

const SidenavShapePanel = () => {
  const {
    config: { sidenavType },
    configDispatch,
  } = useSettingsContext();

  const {
    settingsPanelConfig: { disableSidenavShapeSection },
  } = useSettingsPanelContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (event) => {
    router.replace(pathname);
    const value = event.target.value;

    configDispatch({
      type: SET_SIDENAV_SHAPE,
      payload: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={sidenavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={
              <SidenavDefaultIllustration
                active={!disableSidenavShapeSection && sidenavType === 'default'}
              />
            }
            active={!disableSidenavShapeSection && sidenavType === 'default'}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={
              <SlimIllustration active={!disableSidenavShapeSection && sidenavType === 'slim'} />
            }
            active={!disableSidenavShapeSection && sidenavType === 'slim'}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={
              <StackedIllustration
                active={!disableSidenavShapeSection && sidenavType === 'stacked'}
              />
            }
            active={!disableSidenavShapeSection && sidenavType === 'stacked'}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default SidenavShapePanel;
