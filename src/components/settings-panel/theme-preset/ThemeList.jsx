'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useThemeMode } from 'hooks/useThemeMode';
import { allPalettes } from 'theme/palettes';
import IconifyIcon from 'components/base/IconifyIcon';
import PrimaryColorPicker from './PrimaryColorPicker';
import ThemeListItem from './ThemeListItem';
import { ThemeRadio, themeListRowSx } from './ThemeRadio';

function organizeThemes() {
  const defaultThemes = [];
  const customThemes = [];

  Object.entries(allPalettes).forEach(([preset, palette]) => {
    if (preset.startsWith('default-')) {
      defaultThemes.push([preset, palette]);
    } else {
      customThemes.push([preset, palette]);
    }
  });

  return { defaultThemes, customThemes };
}

const ThemeList = ({ variant = 'default' }) => {
  const { setThemePreset, setThemeMode, themePreset, mode } = useThemeMode();
  const router = useRouter();
  const pathname = usePathname();
  const [isDefaultSectionOpen, setIsDefaultSectionOpen] = useState(true);

  const isSystemSelected = mode === 'system';

  const handleThemeChange = useCallback(
    (preset) => {
      router.replace(pathname);
      setThemePreset(preset);
    },
    [router, pathname, setThemePreset],
  );

  const { defaultThemes, customThemes } = organizeThemes();
  const isDefaultThemeActive = themePreset.startsWith('default-');

  const handleSystemThemeSelect = useCallback(() => {
    router.replace(pathname);
    setThemeMode('system');
    setThemePreset('default-light', { updateMode: false });
  }, [router, pathname, setThemeMode, setThemePreset]);

  const expandIcon = isDefaultSectionOpen
    ? 'material-symbols:keyboard-arrow-up-rounded'
    : 'material-symbols:keyboard-arrow-down-rounded';

  return (
    <>
      <List
        dense
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: variant === 'default' ? 1 : 0,
        }}
      >
        <ListItem
          secondaryAction={
            <IconButton edge="end" onClick={() => setIsDefaultSectionOpen(!isDefaultSectionOpen)}>
              <IconifyIcon icon={expandIcon} />
            </IconButton>
          }
          dense
          disablePadding
        >
          <ListItemButton
            dense
            selected={isDefaultThemeActive}
            onClick={() => handleThemeChange('default-light')}
            sx={themeListRowSx(variant)}
          >
            <ListItemIcon>
              <ThemeRadio checked={isDefaultThemeActive} />
            </ListItemIcon>
            <ListItemText primary="Default" />
          </ListItemButton>
        </ListItem>

        <Collapse in={isDefaultSectionOpen} timeout="auto" unmountOnExit>
          <List
            disablePadding
            dense
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: variant === 'default' ? 0.5 : 0,
              pl: variant === 'menu' ? 0 : 2,
            }}
          >
            {defaultThemes.map(([preset, palette]) => (
              <ThemeListItem
                key={preset}
                preset={preset}
                palette={palette}
                isSelected={!isSystemSelected && preset === themePreset}
                onSelect={handleThemeChange}
                variant={variant}
                isNested
              />
            ))}

            <ListItem
              secondaryAction={
                <IconifyIcon
                  icon="material-symbols:monitor-outline-rounded"
                  fontSize={18}
                  display="block"
                />
              }
              disablePadding
              sx={{ alignItems: 'center' }}
            >
              <ListItemButton
                dense
                selected={isSystemSelected}
                onClick={handleSystemThemeSelect}
                sx={themeListRowSx(variant, true)}
              >
                <ListItemIcon>
                  <ThemeRadio checked={isSystemSelected} />
                </ListItemIcon>
                <ListItemText primary="System" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        {customThemes.map(([preset, palette]) => (
          <ThemeListItem
            key={preset}
            preset={preset}
            palette={palette}
            isSelected={!isSystemSelected && preset === themePreset}
            onSelect={handleThemeChange}
            variant={variant}
          />
        ))}
      </List>

      <PrimaryColorPicker variant={variant} />
    </>
  );
};

export default ThemeList;
